#!/bin/sh
# Crée le rôle applicatif (soumis à RLS) avec son mot de passe. Les tables et droits sont créés par les migrations de l'API.
set -e
psql -v ON_ERROR_STOP=1 -U postgres -d vision -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='vision_app') THEN CREATE ROLE vision_app LOGIN PASSWORD '${PG_APP_PASSWORD}'; END IF; END \$\$;"
