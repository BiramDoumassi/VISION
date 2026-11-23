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

- Globe 3D et vue 2D, zoom, recentrage.
- 8 couches activables : sites, fournisseurs (rangs 1 à 3), flux logistiques, alertes ; conflits, restrictions export, catastrophes, détroits.
- Croisement automatique avec un rayon réglable (50 km par défaut) : un fournisseur proche d'un conflit ou situé dans un pays sous restriction passe en critique ; un flux qui traverse un détroit fermé passe en vigilance.
- Pile d'alertes triée par gravité puis par valeur exposée ; un clic vole vers l'objet et ouvre sa fiche.
- Fiche d'entité : statut expliqué avec sources, chiffres clés, liens amont/aval, historique des décisions.
- Simuler : sites touchés, retard estimé, valeur en transit exposée, alternatives classées avec contrôle sanctions ; les flux touchés s'allument sur le globe.
- Décider : formulaire Tier 2 (décision, motif, alternatives écartées, responsable), enregistré dans un Decision Ledger local.
- FR/EN, thèmes Signal et Monochrome.

## Importer les données d'un client

Bouton **Importer** dans le panneau Couches. Formats : `.xlsx` (onglets « Sites » et « Fournisseurs ») ou `.csv` (`;` ou `,`).
Le modèle est servi par l'application : `/modele-import-vision.xlsx` (généré par `scripts/build-refdata.mjs`).

- Colonnes obligatoires : **Nom**, **Pays**. Conseillées : Ville, Rang, Produit, Part des achats, Délai, Approvisionne.
- Géolocalisation, dans cet ordre : Latitude/Longitude si renseignées → ville (référentiel GeoNames, villes de 5 000 habitants et plus) → centre du pays (signalé comme approximatif).
- « Approvisionne » trace les flux (noms séparés par `;`) ; « Alternatives » alimente la simulation.
- Un rapport liste les lignes ignorées ou approximatives avant l'affichage.
- Le fichier est lu dans le navigateur et conservé localement ; rien n'est envoyé sur le réseau. « Revenir à la démo » efface l'import.

## Limites connues (à traiter ensuite)

- Les couches Monde (conflits, sanctions, catastrophes, détroits) restent des événements de démonstration.
- Pas de connecteur ERP direct (l'import passe par Excel/CSV). Les flux maritimes importés ne sont pas encore routés par les détroits.
- Le Decision Ledger est stocké dans le navigateur : à remplacer par l'API NestJS + PostgreSQL (RLS) + Keycloak.
- Pas encore de frise temporelle, ni d'actions Commander / Incident / Briefer, ni de barre VISION AI (la barre actuelle est une recherche locale).
- Fond de carte 1:110m (pays) : suffisant pour la démo, à remplacer par des tuiles vectorielles auto-hébergées pour le zoom fin.

## Attributions

- Fond de carte : Natural Earth (domaine public), via `world-atlas`.
- Villes : GeoNames (CC BY 4.0), via `all-the-cities`. Noms de pays : `i18n-iso-countries`.
