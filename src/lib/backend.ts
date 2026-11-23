// Mode de fonctionnement lu au démarrage dans /config.json (fichier statique modifiable à l'installation) :
//  - « local » : tout reste dans le navigateur (démo, poste isolé) ;
//  - « api »   : connexion Keycloak (OIDC + PKCE) et données dans l'API NestJS / PostgreSQL.
import type { User, UserManager } from "oidc-client-ts";

export type RuntimeConfig = {
  apiUrl?: string;
  oidc?: { authority: string; clientId: string };
};
export type Me = { sub: string; name: string; org: string; roles: string[] };

let cfg: RuntimeConfig = {};
let mgr: UserManager | null = null;
let user: User | null = null;

export const apiEnabled = () => !!cfg.apiUrl;

export async function initBackend(): Promise<{ mode: "local" } | { mode: "api"; me: Me }> {
  try { cfg = await (await fetch("/config.json", { cache: "no-store" })).json(); } catch { cfg = {}; }
  if (!cfg.apiUrl) return { mode: "local" };

  if (cfg.oidc) {
    const { UserManager, WebStorageStateStore } = await import("oidc-client-ts");
    const base = `${window.location.origin}/`;
    mgr = new UserManager({
      authority: cfg.oidc.authority, client_id: cfg.oidc.clientId, redirect_uri: base, post_logout_redirect_uri: base,
      response_type: "code", scope: "openid profile", automaticSilentRenew: true,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    });
    const url = new URL(window.location.href);
    if (url.searchParams.has("code") && url.searchParams.has("state")) {
      user = await mgr.signinRedirectCallback();
      window.history.replaceState({}, "", base);
    } else {
      user = await mgr.getUser();
    }
    if (!user || user.expired) {
      await mgr.signinRedirect();
      return new Promise(() => undefined); // la page part vers Keycloak
    }
    mgr.events.addUserLoaded((u) => { user = u; });
  }
  const me = await api<Me>("GET", "/me");
  return { mode: "api", me };
}

export async function logout() {
  if (mgr) await mgr.signoutRedirect();
}

export async function api<T>(method: "GET" | "POST" | "PUT" | "PATCH", path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (user?.access_token) headers.authorization = `Bearer ${user.access_token}`;
  const r = await fetch(`${cfg.apiUrl!.replace(/\/$/, "")}/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) {
    let msg = `${r.status}`;
    try { msg = (await r.json()).message ?? msg; } catch { /* corps non JSON */ }
    throw new Error(msg);
  }
  const text = await r.text(); // un corps vide signifie « rien » (ex. aucun jeu de données encore enregistré)
  return (text ? JSON.parse(text) : null) as T;
}
