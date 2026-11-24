# VISION — globe unifié

Socle de code de VISION, construit à partir du Prompt 51 « VISION — Globe unifié » et de la maquette Figma Make (tokens Signal/Mono repris tels quels).

Un seul écran : le globe en fond, les données du client par-dessus l'actualité du monde, une fiche d'entité au clic, puis simuler → décider.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # export statique dans out/
npm start          # sert out/ en local
```

Node 20 ou plus. Aucun appel réseau à l'exécution : polices, fond de carte et données sont servis par l'application elle-même (compatible on-premise et DDIL).

## Deux modes de fonctionnement

Le mode est lu au démarrage dans `public/config.json` (fichier statique, modifiable à l'installation sans recompiler).

| Mode | `config.json` | Données | Identité |
| --- | --- | --- | --- |
| Local (démo, poste isolé) | `{}` | Navigateur | Aucune |
| Serveur | `{"apiUrl": "...", "oidc": {"authority": ".../realms/vision", "clientId": "vision-web"}}` | API NestJS + PostgreSQL | Keycloak (OIDC + PKCE) |

### Serveur (lot B)

- `server/` : API NestJS, seul point de vérification du Trust Fabric. Vérifie le jeton Keycloak (signature, émetteur, audience `vision-api`, expiration), lit l'organisation (`org`) et les rôles (`viewer`, `analyst`, `decider`, `admin`).
- PostgreSQL avec Row-Level Security : chaque requête fixe `app.org_id` ; une organisation ne voit jamais les données d'une autre. Le rôle applicatif `vision_app` ne peut rien supprimer : Decision Ledger et journal d'audit en ajout seul.
- Routes : `GET /health`, `GET /api/me`, `GET|PUT /api/dataset`, `GET|POST /api/decisions`, `GET|POST /api/orders`, `GET|POST /api/incidents`, `PATCH /api/incidents/:id/close`, `GET /api/audit` (admin). Toute écriture est journalisée.
- Droits dans l'interface : Décider et Commander exigent `decider` ; Importer et Incident exigent `analyst` ou `decider`.
- Développement sans Keycloak : `AUTH_MODE=dev` (refusé si `NODE_ENV=production`).

```bash
cd server && npm install && npm run build
AUTH_MODE=dev DATABASE_URL=postgres://vision_app@localhost:5432/vision \
  DATABASE_ADMIN_URL=postgres://postgres@localhost:5432/vision node dist/main.js
```

### Données Monde réelles (lot C)

L'API alimente les couches Monde depuis des sources publiques, toutes les 30 minutes, et garde la dernière photo si le réseau tombe.

| Source | Couche | Accès | Variable |
| --- | --- | --- | --- |
| USGS (séismes M5,5+, 7 jours) | Catastrophes | Public, sans clé (domaine public) | `WORLD_SOURCES` contient `usgs` |
| GDACS (alertes orange et rouges, 14 jours : séismes, inondations, cyclones, feux, volcans, sécheresses) | Catastrophes | Public, sans clé | `WORLD_SOURCES` contient `gdacs` |
| ACLED (affrontements, frappes, violences contre des civils, 14 jours) | Conflits | Compte myACLED ; licence requise pour un usage commercial | `acled` + `ACLED_EMAIL`, `ACLED_PASSWORD` |
| Restrictions export / sanctions | Sanctions | Saisie par l'équipe conformité (`POST /api/world/restrictions`, admin), avec la source officielle | — |

- Tant qu'une source n'est pas branchée, sa couche garde les événements de démonstration, marqués DÉMO. Détroits, infrastructures, espaces aériens et satellites restent en démonstration (flux AIS, NOTAM et catalogues orbitaux payants à choisir).
- Site sans Internet : `WORLD_OFFLINE=true`, puis import d'une photo préparée ailleurs via `POST /api/world/import` (admin).
- L'état de chaque source s'affiche dans le panneau Couches (vert : à jour ; rouge : jamais récupérée).
- Les analyseurs sont testés sur des échantillons au format documenté (`cd server && npm test`) ; les appels réels n'ont pas pu être faits depuis l'environnement de développement.

### VISION AI, packs et Policy Center (lot D)

- **Barre VISION AI** : taper une question dans la barre du haut (« fournisseurs à risque en Asie », « commandes qui passent par la mer Rouge », « quel fournisseur est le plus exposé ? »). Les objets cités sont entourés sur le globe et cliquables.
  - Avec `AI_BASE_URL` (serveur) : un modèle open-weight hébergé sur site répond à partir des seules données du client et des couches Monde ; les identifiants inventés par le modèle sont écartés ; chaque question est journalisée.
  - Sans modèle (ou en mode local) : un moteur de règles répond (statut, rang, région, pays, détroit, produit), et l'indique.
  - Toujours consultative : aucune action n'est exécutée par VISION AI.
- **Packs sectoriels** (Réglages, via l'avatar) : Aéronautique ou Défense. Le pack marque les familles de produits critiques dans les fiches et les place en tête des alertes.
- **Policy Center** (Réglages) : niveau d'autonomie, règles de décision, rôles. Le motif obligatoire est appliqué par l'API (`POLICY_REASON_REQUIRED`).
- Maquette Figma : le Prompt 52 masque les écrans gelés et corrige les deux écrans qui touchent aux exclusions.

### Déploiement sur site

`deploy/docker-compose.yml` lance PostgreSQL, Keycloak (realm `vision` importé depuis `deploy/keycloak/vision-realm.json`), l'API et l'interface (nginx).

```bash
PG_ADMIN_PASSWORD=... PG_APP_PASSWORD=... KC_ADMIN_PASSWORD=... \
  docker compose -f deploy/docker-compose.yml up -d --build
```

Interface sur http://localhost:8081. Les deux comptes de démonstration du realm ont un mot de passe temporaire à changer à la première connexion. Pour une installation réelle : remplacer `localhost` par le nom du serveur dans le realm, `deploy/web-config.json` et le compose, passer Keycloak en `start` avec TLS.

## Fonds de carte

Trois fonds, au choix dans le panneau Couches (**Fond de carte**) ; le choix est mémorisé par navigateur :

- **Nuit** (par défaut) : relief assombri et lumières des villes, d'après NASA Blue Marble et Black Marble.
- **Jour** : NASA Blue Marble.
- **Vecteur** : contours Natural Earth seuls (le rendu d'origine).

Les tuiles sont générées au build par `scripts/build-imagery.mjs` à partir de `scripts/imagery/` et servies par l'application : aucune requête externe, compatible DDIL. Provenance, licence et procédure pour monter en résolution : `scripts/imagery/SOURCES.md`.

## Stack

| Rôle | Choix |
| --- | --- |
| Framework | Next.js, `output: "export"` (export statique partout) |
| Style | Tailwind CSS 4, tokens VISION dans `src/app/globals.css` |
| Carte | MapLibre GL JS, projection globe ↔ 2D, fond Natural Earth généré en local (`scripts/build-world.mjs`), imagerie NASA en tuiles locales (`scripts/build-imagery.mjs`) |
| i18n | next-intl côté client (FR/EN), messages dans `src/i18n/messages/` |
| État | Zustand (`src/store/useVision.ts`) |
| Polices | Inter, Inter Tight, IBM Plex Mono via @fontsource (auto-hébergées) |

## Organisation

```
src/
  app/                 layout, page unique, styles globaux
  components/
    Globe.tsx          carte MapLibre, couches, clics, survol
    TopBar.tsx         recherche (⌘K), horloge UTC, FR/EN, thème, alertes
    LayersPanel.tsx    couches « Vos données » / « Monde », rayon de croisement
    MapChrome.tsx      contrôles 2D/3D/zoom, légende, pile d'alertes
    EntityPanel.tsx    fiche d'entité, simulation, formulaire de décision, historique
  data/demo.ts         client fictif Compositec Industrie (3 sites, 11 fournisseurs, flux, événements DÉMO)
  lib/crossing.ts      moteur de croisement Monde × Vos données, simulation de rupture, géométrie des flux
```

## Ce qui fonctionne

- Globe 3D et vue 2D, zoom, recentrage, cadrage automatique après import.
- 12 couches : sites, fournisseurs (rangs 1 à 3), flux logistiques, alertes ; conflits, sanctions et restrictions export, catastrophes, détroits, espaces aériens fermés, infrastructures critiques, spatial, risque pays. Sous-filtres pour les conflits, catastrophes, infrastructures et satellites.
- Frise temporelle de −30 à +14 jours : les couches Monde et le croisement suivent la date ; bouton pour rejouer les 30 derniers jours. Les dates de démo sont relatives à aujourd'hui.
- Croisement automatique (rayon réglable, 50 km par défaut) : conflit ou restriction en vigueur → critique ; catastrophe, infrastructure perturbée, détroit fermé sur une route maritime, espace aérien fermé sur une route aérienne, restriction prévue sous 14 jours → vigilance.
- Brief quotidien « Depuis hier » et pile d'alertes, avec le nombre d'incidents ouverts.
- Fiche d'entité pour tous les objets : sites, fournisseurs, événements, détroits, infrastructures, espaces aériens, satellites, et variante pays (score de risque, restrictions, événements, votre exposition). Clic sur un pays ou recherche par nom.
- Actions : Simuler, Décider (Tier 2), Commander (fournisseurs alternatifs « Vendu par », contrôle sanctions, demande sans paiement tracée dans le Decision Ledger), Incident, Briefer (note de situation d'une page, imprimable en PDF).
- Import Excel/CSV des données client, FR/EN, thèmes Signal et Monochrome.

## Importer les données d'un client

Bouton **Importer** dans le panneau Couches. Formats : `.xlsx` (onglets « Sites » et « Fournisseurs ») ou `.csv` (`;` ou `,`).
Le modèle est servi par l'application : `/modele-import-vision.xlsx` (généré par `scripts/build-refdata.mjs`).

- Colonnes obligatoires : **Nom**, **Pays**. Conseillées : Ville, Rang, Produit, Part des achats, Délai, Approvisionne.
- Géolocalisation, dans cet ordre : Latitude/Longitude si renseignées → ville (référentiel GeoNames, villes de 5 000 habitants et plus) → centre du pays (signalé comme approximatif).
- « Approvisionne » trace les flux (noms séparés par `;`) ; « Alternatives » alimente la simulation.
- Un rapport liste les lignes ignorées ou approximatives avant l'affichage.
- Le fichier est lu dans le navigateur et conservé localement ; rien n'est envoyé sur le réseau. « Revenir à la démo » efface l'import.

## Limites connues (à traiter ensuite)

- En mode local (sans serveur), les couches Monde restent des événements de démonstration.
- Le déploiement Docker et le realm Keycloak n'ont pas pu être lancés dans l'environnement de développement (images inaccessibles) : à valider au premier `docker compose up`. L'API, PostgreSQL/RLS et la vérification des jetons OIDC ont été testés.
- La barre VISION AI a été testée avec un faux serveur de modèle compatible ; le choix et le dimensionnement du modèle réel (et du GPU) restent à faire.
- Pas de connecteur ERP direct (l'import passe par Excel/CSV). Les flux maritimes importés ne sont pas encore routés par les détroits.
- Le Decision Ledger est stocké dans le navigateur : à remplacer par l'API NestJS + PostgreSQL (RLS) + Keycloak.
- Pas encore de frise temporelle, ni d'actions Commander / Incident / Briefer, ni de barre VISION AI (la barre actuelle est une recherche locale).
- Fond de carte 1:110m (pays) : suffisant pour la démo, à remplacer par des tuiles vectorielles auto-hébergées pour le zoom fin.

## Attributions

- Fond de carte : Natural Earth (domaine public), via `world-atlas`.
- Villes : GeoNames (CC BY 4.0), via `all-the-cities`. Noms de pays : `i18n-iso-countries`.
