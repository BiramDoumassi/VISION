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

## Stack

| Rôle | Choix |
| --- | --- |
| Framework | Next.js, `output: "export"` (export statique partout) |
| Style | Tailwind CSS 4, tokens VISION dans `src/app/globals.css` |
| Carte | MapLibre GL JS, projection globe ↔ 2D, fond Natural Earth généré en local (`scripts/build-world.mjs`) |
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

- Les couches Monde restent des événements de démonstration (lot C : ingestion des vraies sources côté serveur).
- Decision Ledger, commandes et incidents sont stockés dans le navigateur (lot B : NestJS, PostgreSQL, Keycloak).
- La barre de recherche n'est pas encore la barre VISION AI en langage naturel (lot D).
- Pas de connecteur ERP direct (l'import passe par Excel/CSV). Les flux maritimes importés ne sont pas encore routés par les détroits.
- Le Decision Ledger est stocké dans le navigateur : à remplacer par l'API NestJS + PostgreSQL (RLS) + Keycloak.
- Pas encore de frise temporelle, ni d'actions Commander / Incident / Briefer, ni de barre VISION AI (la barre actuelle est une recherche locale).
- Fond de carte 1:110m (pays) : suffisant pour la démo, à remplacer par des tuiles vectorielles auto-hébergées pour le zoom fin.

## Attributions

- Fond de carte : Natural Earth (domaine public), via `world-atlas`.
- Villes : GeoNames (CC BY 4.0), via `all-the-cities`. Noms de pays : `i18n-iso-countries`.
