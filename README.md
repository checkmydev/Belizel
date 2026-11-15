# Belizel · Guide de la Gaume

Site du gîte **Belizel** à Izel (Chiny, Gaume, Belgique), en français, néerlandais et anglais (`?lang=fr|nl|en`), en deux parties :

- **`index.html`, le guide des voyageurs** : présentation de la maison, météo en direct, carte interactive, 124 balades balisées (GPX et pack pour Organic Maps), activités, agenda, terroir, histoire du village, planificateur « Mon séjour » et mode d'emploi de la maison (protégé par un code invité).
- **`admin.html`, l'espace propriétaire** : analyse du marché (80 annonces voisines), tarifs saisonniers, avis, équipements, optimisation de l'annonce, suivi financier (import du CSV Airbnb), édition des contenus.

Le site est statique et hébergé sur GitHub Pages. Les données privées (finances, concurrence, mode d'emploi) sont stockées dans Supabase (schéma `belizel`, protégé par des règles RLS) : voir `supabase/belizel_schema.sql`.

## Mettre à jour les données publiques

```
python tools/build_hikes.py tools/osm_routes.json   # balades (OpenStreetMap + altitudes EU-DEM)
python tools/describe_hikes.py                      # descriptions FR/NL/EN (forêt, villages, rivières, chemins) — requiert tools/osm_area.json et osm_context.json (requêtes Overpass)
python tools/build_content.py                       # événements, activités, histoire, terroir (FR + NL + EN)
python tools/build_i18n_en.py                       # interface anglaise (js/i18n.en.js) + annonce, mode d'emploi, histoires en EN
python tools/add_lang_supabase.py en                # ajoute la version EN du mode d'emploi et des histoires dans Supabase sans écraser l'existant
```

Crédits : tracés © contributeurs OpenStreetMap (ODbL) ; altitudes OpenTopoData (EU-DEM) ; météo Open-Meteo ; fonds de carte OpenStreetMap, OpenTopoMap et Esri.
