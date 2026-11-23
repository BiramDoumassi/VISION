// Accès PostgreSQL. Chaque requête métier passe par withOrg(), qui ouvre une transaction et fixe
// app.org_id : les politiques RLS filtrent alors toutes les lignes sur l'organisation de l'appelant.
import { Pool, type PoolClient } from "pg";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const config = {
  // Connexion applicative (rôle vision_app, soumis à RLS)
  appUrl: process.env.DATABASE_URL ?? "postgres://vision_app@localhost:5432/vision",
  // Connexion d'administration, utilisée uniquement pour les migrations au démarrage
  adminUrl: process.env.DATABASE_ADMIN_URL ?? process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/vision",
};

export const pool = new Pool({ connectionString: config.appUrl, max: 10 });

export async function withOrg<T>(orgId: string, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT set_config('app.org_id', $1, true)", [orgId]);
    const out = await fn(c);
    await c.query("COMMIT");
    return out;
  } catch (e) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    c.release();
  }
}

export async function audit(c: PoolClient, orgId: string, actor: string, action: string, objectType: string, objectId: string | null, details: unknown = {}) {
  await c.query(
    "INSERT INTO audit_log (org_id, actor, action, object_type, object_id, details) VALUES ($1, $2, $3, $4, $5, $6)",
    [orgId, actor, action, objectType, objectId, JSON.stringify(details)],
  );
}

// Migrations SQL versionnées, appliquées une seule fois chacune, avec le compte d'administration.
export async function migrate() {
  const admin = new Pool({ connectionString: config.adminUrl, max: 1 });
  try {
    await admin.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const dir = join(__dirname, "..", "migrations");
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
      const done = await admin.query("SELECT 1 FROM schema_migrations WHERE name = $1", [f]);
      if (done.rowCount) continue;
      await admin.query("BEGIN");
      await admin.query(readFileSync(join(dir, f), "utf8"));
      await admin.query("INSERT INTO schema_migrations (name) VALUES ($1)", [f]);
      await admin.query("COMMIT");
      console.log(`migration appliquée : ${f}`);
    }
    // Organisations déclarées par configuration (ex. VISION_ORGS="demo:Compositec Industrie,acme:ACME")
    for (const pair of (process.env.VISION_ORGS ?? "demo:Démonstration").split(",").filter(Boolean)) {
      const [id, ...name] = pair.split(":");
      await admin.query("INSERT INTO organisations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [id.trim(), name.join(":").trim() || id.trim()]);
    }
  } finally {
    await admin.end();
  }
}
