// Trust Fabric — vérification d'identité côté NestJS (seul point de vérification).
// Mode « keycloak » : jeton OIDC signé, vérifié avec les clés publiques (JWKS) du realm VISION.
// Mode « dev »      : en-têtes X-Dev-User / X-Dev-Org / X-Dev-Roles, refusé si NODE_ENV=production.
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { Request } from "express";

export type Role = "viewer" | "analyst" | "decider" | "admin";
export type Principal = { sub: string; name: string; org: string; roles: Role[] };
export type AuthedRequest = Request & { principal?: Principal };

const mode = process.env.AUTH_MODE ?? "keycloak";
if (mode === "dev" && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_MODE=dev est interdit en production");
}

const issuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/vision";
const audience = process.env.KEYCLOAK_AUDIENCE ?? "vision-api";
// URL des clés publiques : interne au réseau Docker si précisée, sinon dérivée de l'émetteur.
const jwks = createRemoteJWKSet(new URL(process.env.KEYCLOAK_JWKS_URL ?? `${issuer}/protocol/openid-connect/certs`));
const KNOWN: Role[] = ["viewer", "analyst", "decider", "admin"];

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

async function principalFrom(req: Request): Promise<Principal> {
  if (mode === "dev") {
    const sub = String(req.header("x-dev-user") ?? "dev");
    const roles = String(req.header("x-dev-roles") ?? "viewer,analyst,decider").split(",").map((r) => r.trim()).filter((r): r is Role => KNOWN.includes(r as Role));
    return { sub, name: sub, org: String(req.header("x-dev-org") ?? "demo"), roles };
  }
  const h = req.header("authorization") ?? "";
  if (!h.startsWith("Bearer ")) throw new UnauthorizedException("Jeton manquant");
  let p: JWTPayload & { org?: string | string[]; preferred_username?: string; name?: string; realm_access?: { roles?: string[] } };
  try {
    ({ payload: p } = await jwtVerify(h.slice(7), jwks, { issuer, audience }));
  } catch {
    throw new UnauthorizedException("Jeton invalide ou expiré");
  }
  const org = Array.isArray(p.org) ? p.org[0] : p.org;
  if (!org) throw new ForbiddenException("Aucune organisation rattachée à cet utilisateur");
  const roles = (p.realm_access?.roles ?? []).filter((r): r is Role => KNOWN.includes(r as Role));
  return { sub: String(p.sub), name: p.name ?? p.preferred_username ?? String(p.sub), org, roles };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (req.path === "/health") return true;
    const principal = await principalFrom(req);
    const needed = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]) ?? ["viewer"];
    const ok = principal.roles.includes("admin") || needed.some((r) => principal.roles.includes(r));
    if (!ok) throw new ForbiddenException(`Rôle requis : ${needed.join(" ou ")}`);
    req.principal = principal;
    return true;
  }
}
