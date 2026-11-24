# Textures du globe : provenance

Les deux textures sont découpées en tuiles au build par `scripts/build-imagery.mjs` et servies par VISION elle-même, sans aucun appel réseau à l'exécution.

| Fichier | Contenu | Origine |
| --- | --- | --- |
| `earth-day.jpg` (4096 × 2048) | NASA Blue Marble, vue de jour | Copie 4096 px publiée dans le dépôt `vasturiano/three-globe` (`example/img/earth-blue-marble.jpg`) |
| `earth-night.jpg` (4096 × 2048) | Vue de nuit composée pour VISION : relief Blue Marble assombri aux couleurs du thème Signal, avec les lumières des villes extraites de la texture de nuit NASA de ce même dépôt (`example/img/earth-night.jpg`) | Composition faite le 24 nov. 2026 |

Les images de la NASA sont en principe libres d'usage, à condition de créditer la NASA (crédit affiché sur la carte : « NASA Blue Marble · Black Marble »). Avant un déploiement commercial, il faut vérifier les conditions d'usage auprès de la NASA et remplacer les copies ci-dessus par les originaux téléchargés directement depuis les sites de la NASA.

## Plus de détail au zoom

Les tuiles vont aujourd'hui jusqu'au zoom 4, soit environ 10 km par pixel. Pour aller plus loin :

1. Télécharger l'original sur visibleearth.nasa.gov, au format équirectangulaire 2:1 :
   - Black Marble 2016 Color, 13 500 × 6 750 (`BlackMarble_2016_3km.jpg`)
   - Blue Marble (land, shallow water and shaded topography)
2. Le renommer `earth-night.jpg` ou `earth-day.jpg` et remplacer le fichier dans ce dossier.
3. Relancer `npm run build`, ou le build Docker.

Le script monte alors jusqu'au zoom 5 (largeur plafonnée à 8 192 px). Pour un niveau de détail du site ou du bâtiment, il faudra des tuiles d'imagerie haute résolution hébergées sur site : c'est un choix de fournisseur et de licence.
