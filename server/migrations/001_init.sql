-- VISION — schéma initial.
-- Toutes les tables métier portent org_id et sont protégées par Row-Level Security :
-- l'API ouvre chaque requête dans une transaction avec SET LOCAL app.org_id, issu du jeton vérifié.
-- Le rôle applicatif vision_app n'est pas propriétaire des tables et ne peut donc pas contourner RLS.

CREATE TABLE IF NOT EXISTS organisations (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Jeu de données client (sites, fournisseurs, flux) : un document par organisation.
CREATE TABLE IF NOT EXISTS datasets (
  org_id      text PRIMARY KEY REFERENCES organisations(id),
  source      text NOT NULL CHECK (source IN ('demo', 'import')),
  client_name text NOT NULL,
  file_name   text,
  payload     jsonb NOT NULL,
  updated_by  text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Decision Ledger : qui a décidé quoi, pourquoi, avec quelles alternatives écartées. Jamais modifié, jamais supprimé.
CREATE TABLE IF NOT EXISTS decisions (
  id          text PRIMARY KEY,
  org_id      text NOT NULL REFERENCES organisations(id),
  entity_id   text NOT NULL,
  decision    text NOT NULL,
  reason      text NOT NULL DEFAULT '',
  rejected    text NOT NULL DEFAULT '',
  owner       text NOT NULL,
  signed_by   text NOT NULL,
  at          timestamptz NOT NULL DEFAULT now()
);

-- Demandes de commande (catalogue uniquement : aucune donnée bancaire, aucun paiement).
CREATE TABLE IF NOT EXISTS orders (
  id          text PRIMARY KEY,
  org_id      text NOT NULL REFERENCES organisations(id),
  entity_id   text NOT NULL,
  vendor_id   text NOT NULL,
  vendor_name text NOT NULL,
  quantity    text NOT NULL DEFAULT '',
  note        text NOT NULL DEFAULT '',
  owner       text NOT NULL,
  requested_by text NOT NULL,
  at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incidents (
  id          text PRIMARY KEY,
  org_id      text NOT NULL REFERENCES organisations(id),
  entity_id   text NOT NULL,
  title       text NOT NULL,
  severity    text NOT NULL CHECK (severity IN ('high', 'medium')),
  owner       text NOT NULL,
  due         date NOT NULL,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_by   text NOT NULL,
  at          timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz
);

-- Journal d'audit en ajout seul.
CREATE TABLE IF NOT EXISTS audit_log (
  id          bigserial PRIMARY KEY,
  org_id      text NOT NULL REFERENCES organisations(id),
  actor       text NOT NULL,
  action      text NOT NULL,
  object_type text NOT NULL,
  object_id   text,
  details     jsonb NOT NULL DEFAULT '{}'::jsonb,
  at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decisions_org_entity ON decisions (org_id, entity_id);
CREATE INDEX IF NOT EXISTS orders_org_entity ON orders (org_id, entity_id);
CREATE INDEX IF NOT EXISTS incidents_org_entity ON incidents (org_id, entity_id);
CREATE INDEX IF NOT EXISTS audit_org_at ON audit_log (org_id, at DESC);

-- ── Row-Level Security ───────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['datasets', 'decisions', 'orders', 'incidents', 'audit_log'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS org_isolation ON %I', t);
    EXECUTE format($p$CREATE POLICY org_isolation ON %I
      USING (org_id = current_setting('app.org_id', true))
      WITH CHECK (org_id = current_setting('app.org_id', true))$p$, t);
  END LOOP;
END $$;

-- ── Rôle applicatif ──────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vision_app') THEN
    CREATE ROLE vision_app LOGIN;
  END IF;
END $$;
GRANT SELECT ON organisations TO vision_app;
GRANT SELECT, INSERT, UPDATE ON datasets TO vision_app;
GRANT SELECT, INSERT ON decisions, orders, audit_log TO vision_app;
GRANT SELECT, INSERT, UPDATE ON incidents TO vision_app;
GRANT USAGE ON SEQUENCE audit_log_id_seq TO vision_app;
-- Pas de DELETE : le Decision Ledger et le journal d'audit sont en ajout seul.
