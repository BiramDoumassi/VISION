import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Put, Query, Req } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { audit, withOrg } from "./db";
import { Roles, type AuthedRequest, type Principal } from "./auth";

const newId = (p: string) => `${p}-${randomBytes(5).toString("hex").toUpperCase()}`;
const who = (req: AuthedRequest): Principal => req.principal!;
function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (!r.success) throw new BadRequestException(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return r.data;
}

// ── Schémas d'entrée ──────────────────────────────────────────────────────────
const txt = z.object({ fr: z.string(), en: z.string() });
const coord = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const site = z.object({ id: z.string(), kind: z.literal("site"), name: z.string().min(1), city: z.string(), country: z.string(), countryIso: z.string().optional(), coord, type: txt, staff: z.number(), lines: z.number() });
const supplier = z.object({
  id: z.string(), kind: z.literal("supplier"), name: z.string().min(1), city: z.string(), country: z.string(), countryIso: z.string(), coord,
  rank: z.union([z.literal(1), z.literal(2), z.literal(3)]), product: txt, sharePct: z.number(), leadDays: z.number(), refs: z.number(),
  soleSourceRefs: z.number(), feeds: z.array(z.string()), alternatives: z.array(z.string()), annualValueKEur: z.number(), priceIndex: z.number(),
});
const flow = z.object({ id: z.string(), from: z.string(), to: z.string(), mode: z.enum(["sea", "road", "air"]), via: z.array(z.string()), ordersInTransit: z.number(), valueKEur: z.number() });
const DatasetIn = z.object({
  source: z.enum(["demo", "import"]), clientName: z.string().min(1).max(200), fileName: z.string().max(260).optional(),
  sites: z.array(site).max(5000), suppliers: z.array(supplier).max(20000), flows: z.array(flow).max(50000),
});
const DecisionIn = z.object({ entityId: z.string().min(1), decision: z.string().min(1).max(2000), reason: z.string().max(4000).default(""), rejected: z.string().max(2000).default(""), owner: z.string().min(1).max(200) });
const OrderIn = z.object({ entityId: z.string().min(1), vendorId: z.string().min(1), vendorName: z.string().min(1).max(200), quantity: z.string().max(200).default(""), note: z.string().max(2000).default(""), owner: z.string().min(1).max(200) });
const IncidentIn = z.object({ entityId: z.string().min(1), title: z.string().min(1).max(300), severity: z.enum(["high", "medium"]), owner: z.string().min(1).max(200), due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

@Controller()
export class ApiController {
  @Get("health")
  health() { return { status: "ok" }; }

  @Get("me")
  me(@Req() req: AuthedRequest) { return who(req); }

  // ── Jeu de données client ───────────────────────────────────────────────────
  @Get("dataset")
  async getDataset(@Req() req: AuthedRequest) {
    const p = who(req);
    return withOrg(p.org, async (c) => {
      const r = await c.query("SELECT source, client_name, file_name, payload, updated_at FROM datasets");
      if (!r.rowCount) return null;
      const d = r.rows[0];
      return { source: d.source, clientName: d.client_name, fileName: d.file_name ?? undefined, importedAt: d.updated_at, ...d.payload };
    });
  }

  @Put("dataset")
  @Roles("analyst")
  async putDataset(@Req() req: AuthedRequest, @Body() body: unknown) {
    const p = who(req);
    const d = parse(DatasetIn, body);
    return withOrg(p.org, async (c) => {
      await c.query(
        `INSERT INTO datasets (org_id, source, client_name, file_name, payload, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (org_id) DO UPDATE SET source = EXCLUDED.source, client_name = EXCLUDED.client_name, file_name = EXCLUDED.file_name,
           payload = EXCLUDED.payload, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [p.org, d.source, d.clientName, d.fileName ?? null, JSON.stringify({ sites: d.sites, suppliers: d.suppliers, flows: d.flows }), p.sub],
      );
      await audit(c, p.org, p.sub, "dataset.replace", "dataset", null, { source: d.source, fileName: d.fileName, sites: d.sites.length, suppliers: d.suppliers.length, flows: d.flows.length });
      return { ok: true };
    });
  }

  // ── Decision Ledger (ajout seul) ────────────────────────────────────────────
  @Get("decisions")
  async decisions(@Req() req: AuthedRequest, @Query("entityId") entityId?: string) {
    const p = who(req);
    return withOrg(p.org, async (c) => (await c.query(
      `SELECT id, entity_id AS "entityId", decision, reason, rejected, owner, signed_by AS "signedBy", at FROM decisions
       WHERE ($1::text IS NULL OR entity_id = $1) ORDER BY at DESC LIMIT 500`, [entityId ?? null])).rows);
  }

  @Post("decisions")
  @Roles("decider")
  async decide(@Req() req: AuthedRequest, @Body() body: unknown) {
    const p = who(req);
    const d = parse(DecisionIn, body);
    return withOrg(p.org, async (c) => {
      const id = newId("DL");
      const r = await c.query(
        `INSERT INTO decisions (id, org_id, entity_id, decision, reason, rejected, owner, signed_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, entity_id AS "entityId", decision, reason, rejected, owner, signed_by AS "signedBy", at`,
        [id, p.org, d.entityId, d.decision, d.reason, d.rejected, d.owner, p.sub]);
      await audit(c, p.org, p.sub, "decision.sign", "decision", id, { entityId: d.entityId });
      return r.rows[0];
    });
  }

  // ── Demandes de commande (catalogue uniquement) ─────────────────────────────
  @Get("orders")
  async orders(@Req() req: AuthedRequest, @Query("entityId") entityId?: string) {
    const p = who(req);
    return withOrg(p.org, async (c) => (await c.query(
      `SELECT id, entity_id AS "entityId", vendor_id AS "vendorId", vendor_name AS "vendorName", quantity, note, owner, at FROM orders
       WHERE ($1::text IS NULL OR entity_id = $1) ORDER BY at DESC LIMIT 500`, [entityId ?? null])).rows);
  }

  @Post("orders")
  @Roles("decider")
  async order(@Req() req: AuthedRequest, @Body() body: unknown) {
    const p = who(req);
    const o = parse(OrderIn, body);
    return withOrg(p.org, async (c) => {
      const id = newId("CMD");
      const r = await c.query(
        `INSERT INTO orders (id, org_id, entity_id, vendor_id, vendor_name, quantity, note, owner, requested_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, entity_id AS "entityId", vendor_id AS "vendorId", vendor_name AS "vendorName", quantity, note, owner, at`,
        [id, p.org, o.entityId, o.vendorId, o.vendorName, o.quantity, o.note, o.owner, p.sub]);
      // Toute commande est aussi une décision tracée.
      const dl = newId("DL");
      await c.query(`INSERT INTO decisions (id, org_id, entity_id, decision, reason, rejected, owner, signed_by) VALUES ($1,$2,$3,$4,$5,'',$6,$7)`,
        [dl, p.org, o.entityId, `Demande de commande à ${o.vendorName}${o.quantity ? ` (${o.quantity})` : ""}`, o.note, o.owner, p.sub]);
      await audit(c, p.org, p.sub, "order.request", "order", id, { entityId: o.entityId, vendorId: o.vendorId, decisionId: dl });
      return r.rows[0];
    });
  }

  // ── Incidents ───────────────────────────────────────────────────────────────
  @Get("incidents")
  async incidents(@Req() req: AuthedRequest, @Query("status") status?: string) {
    const p = who(req);
    return withOrg(p.org, async (c) => (await c.query(
      `SELECT id, entity_id AS "entityId", title, severity, owner, to_char(due, 'YYYY-MM-DD') AS due, status, at FROM incidents
       WHERE ($1::text IS NULL OR status = $1) ORDER BY at DESC LIMIT 500`, [status ?? null])).rows);
  }

  @Post("incidents")
  @Roles("analyst", "decider")
  async openIncident(@Req() req: AuthedRequest, @Body() body: unknown) {
    const p = who(req);
    const i = parse(IncidentIn, body);
    return withOrg(p.org, async (c) => {
      const id = newId("INC");
      const r = await c.query(
        `INSERT INTO incidents (id, org_id, entity_id, title, severity, owner, due, opened_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, entity_id AS "entityId", title, severity, owner, to_char(due, 'YYYY-MM-DD') AS due, status, at`,
        [id, p.org, i.entityId, i.title, i.severity, i.owner, i.due, p.sub]);
      await audit(c, p.org, p.sub, "incident.open", "incident", id, { entityId: i.entityId, severity: i.severity });
      return r.rows[0];
    });
  }

  @Patch("incidents/:id/close")
  @Roles("analyst", "decider")
  async closeIncident(@Req() req: AuthedRequest, @Param("id") id: string) {
    const p = who(req);
    return withOrg(p.org, async (c) => {
      const r = await c.query(`UPDATE incidents SET status = 'closed', closed_at = now() WHERE id = $1 AND status = 'open' RETURNING id`, [id]);
      if (!r.rowCount) throw new NotFoundException("Incident introuvable ou déjà clos");
      await audit(c, p.org, p.sub, "incident.close", "incident", id);
      return { ok: true };
    });
  }

  // ── Journal d'audit (administrateurs) ───────────────────────────────────────
  @Get("audit")
  @Roles("admin")
  async auditLog(@Req() req: AuthedRequest) {
    const p = who(req);
    return withOrg(p.org, async (c) => (await c.query(
      `SELECT id, actor, action, object_type AS "objectType", object_id AS "objectId", details, at FROM audit_log ORDER BY at DESC LIMIT 1000`)).rows);
  }
}
