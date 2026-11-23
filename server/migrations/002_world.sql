-- Données « Monde » partagées par toutes les organisations (pas de données client ici, donc pas de RLS).
CREATE TABLE IF NOT EXISTS world_items (
  id          text PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('conflict', 'catastrophe', 'restriction')),
  source      text NOT NULL,
  since       date NOT NULL,
  until       date,
  payload     jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS world_items_kind_since ON world_items (kind, since DESC);

-- État de chaque connecteur : dernière réussite, dernière erreur, volume.
CREATE TABLE IF NOT EXISTS world_sources (
  name        text PRIMARY KEY,
  last_ok     timestamptz,
  last_error  text,
  last_try    timestamptz,
  item_count  integer NOT NULL DEFAULT 0
);

GRANT SELECT ON world_items, world_sources TO vision_app;
GRANT INSERT, UPDATE, DELETE ON world_items TO vision_app;
GRANT INSERT, UPDATE ON world_sources TO vision_app;
