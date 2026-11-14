"""Décrit chaque balade à partir d'OpenStreetMap : part en forêt, villages traversés, rivières longées,
types de chemins, curiosités. Ajoute à data/hikes.js les champs `land` (chiffres) et `desc` {fr, nl}.
Entrée : tools/osm_context.json (requête Overpass : relations, ways membres, forêts, lieux, cours d'eau, POI).
Usage : python tools/describe_hikes.py
"""
import json, math, os, re
from collections import Counter, defaultdict
from shapely.geometry import Point, LineString, Polygon
from shapely.ops import polygonize, unary_union
from shapely.strtree import STRtree

D = os.path.dirname(__file__)
HJS = os.path.join(D, '..', 'data', 'hikes.js')
s = open(HJS, encoding='utf-8').read()
head, hikes = s[:s.index('window.HIKES')], json.loads(s[s.index('['):s.rindex(';')])
# osm_context.json : relations des balades + leurs ways (type de chemin) ; osm_area.json : forêts, lieux, cours d'eau, POI de la zone
osm = json.load(open(os.path.join(D, 'osm_context.json'), encoding='utf-8'))['elements'] + json.load(open(os.path.join(D, 'osm_area.json'), encoding='utf-8'))['elements']

LAT0 = 49.69; KX = math.cos(math.radians(LAT0)) * 111320; KY = 110540
P = lambda lat, lon: (lon * KX, lat * KY)

rels = {e['id']: e for e in osm if e['type'] == 'relation' and e.get('tags', {}).get('route')}
ways = {e['id']: e for e in osm if e['type'] == 'way' and e.get('geometry')}
# --- forêts
forest_polys = []
for e in osm:
    t = e.get('tags', {})
    if not (t.get('landuse') == 'forest' or t.get('natural') == 'wood'): continue
    try:
        if e['type'] == 'way' and len(e.get('geometry', [])) >= 4:
            pg = Polygon([P(g['lat'], g['lon']) for g in e['geometry']])
            if pg.is_valid and pg.area > 0: forest_polys.append(pg)
        elif e['type'] == 'relation':
            lines = [LineString([P(g['lat'], g['lon']) for g in m['geometry']]) for m in e.get('members', []) if m.get('role') == 'outer' and m.get('geometry') and len(m['geometry']) > 1]
            for pg in polygonize(unary_union(lines)): forest_polys.append(pg)
    except Exception:
        pass
ftree = STRtree(forest_polys)
# --- lieux, cours d'eau, POI
places = [(e['tags']['name'], Point(P(e['lat'], e['lon'])), e['tags']['place']) for e in osm if e['type'] == 'node' and e.get('tags', {}).get('place') and e['tags'].get('name')]
rivers = [(e['tags']['name'], LineString([P(g['lat'], g['lon']) for g in e['geometry']]), e['tags']['waterway']) for e in osm if e['type'] == 'way' and e.get('tags', {}).get('waterway') and e.get('geometry') and len(e['geometry']) > 1]
rtree = STRtree([r[1] for r in rivers])
pois = []
for e in osm:
    t = e.get('tags', {})
    if e['type'] == 'relation' or 'landuse' in t or 'waterway' in t or 'place' in t or 'route' in t or t.get('natural') == 'wood': continue
    c = e.get('center') or ({'lat': e['lat'], 'lon': e['lon']} if 'lat' in e else None)
    if not c: continue
    kind = None
    if t.get('tourism') == 'viewpoint': kind = 'view'
    elif t.get('amenity') == 'place_of_worship': kind = 'chapel'
    elif t.get('historic') in ('castle', 'manor'): kind = 'castle'
    elif t.get('historic') in ('ruins', 'archaeological_site', 'fort'): kind = 'ruins'
    elif t.get('historic') in ('wayside_cross', 'wayside_shrine', 'memorial', 'monument', 'boundary_stone', 'milestone'): kind = 'heritage'
    elif t.get('historic'): kind = 'heritage'
    elif t.get('natural') in ('peak', 'rock'): kind = 'rock'
    elif t.get('natural') == 'cave_entrance': kind = 'cave'
    elif t.get('natural') == 'spring': kind = 'spring'
    elif t.get('man_made') == 'tower': kind = 'tower'
    if kind: pois.append((kind, t.get('name'), Point(P(c['lat'], c['lon']))))

def surf(hw):
    if hw in ('path', 'footway', 'bridleway', 'steps', 'pedestrian'): return 'sentier'
    if hw == 'track': return 'chemin'
    if hw in ('cycleway',): return 'piste'
    return 'route'

def fmt(n): return str(round(n, 1)).replace('.', ',')
def join(xs, et):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + f' {et} ' + xs[-1]

for h in hikes:
    pts = [Point(P(a, b)) for a, b in h['samples']]
    route = LineString([(p.x, p.y) for p in pts]); rb = route.buffer(650)
    n = len(pts); step = h['km'] / max(1, n - 1)
    # forêt
    inside = 0
    for p in pts:
        if any(forest_polys[i].contains(p) for i in ftree.query(p)): inside += 1
    forest = inside / n
    # chemins : ways membres de la relation
    rel = rels.get(h['id'])
    mw = [ways[m['ref']] for m in (rel or {}).get('members', []) if m['type'] == 'way' and m['ref'] in ways]
    lines = [LineString([P(g['lat'], g['lon']) for g in w['geometry']]) for w in mw if len(w['geometry']) > 1]
    kinds = [surf(w.get('tags', {}).get('highway', 'path')) for w in mw if len(w['geometry']) > 1]
    sc = Counter()
    if lines:
        wt = STRtree(lines)
        for p in pts:
            i = wt.nearest(p); sc[kinds[i]] += 1
    tot = sum(sc.values()) or 1
    shares = {k: v / tot for k, v in sc.items()}
    # villages (ordre de passage)
    vil = {}
    for name, pt, kind in places:
        if not rb.contains(pt): continue
        dist = route.distance(pt); lim = 600 if kind in ('town', 'village') else 350
        if dist < lim: vil[name] = (route.project(pt), kind)
    villages = [k for k, _ in sorted(vil.items(), key=lambda kv: kv[1][0])]
    # rivières
    rc = Counter(); cross = set()
    for p in pts:
        for i in rtree.query(p.buffer(70)):
            nm, ln, kind = rivers[i]
            nm = re.sub(r"^(la |le |les |l')", '', nm, flags=re.I); nm = nm[0].upper() + nm[1:]
            if ln.distance(p) < 70: rc[nm] += 1
    along = {nm: c * step for nm, c in rc.items()}
    riv = sorted(along.items(), key=lambda kv: -kv[1])
    # POI
    seen = set(); found = []
    for kind, nm, pt in pois:
        if rb.contains(pt) and route.distance(pt) < 90:
            key = (kind, nm or id(pt))
            if key in seen: continue
            seen.add(key); found.append((kind, nm))
    named = [(k, nm) for k, nm in found if nm]
    cnt = Counter(k for k, _ in found)
    land = {'forest': round(forest * 100), 'sentier': round(shares.get('sentier', 0) * 100), 'chemin': round(shares.get('chemin', 0) * 100),
            'route': round((shares.get('route', 0) + shares.get('piste', 0)) * 100), 'villages': villages[:6],
            'rivers': [[nm, round(km, 1)] for nm, km in riv[:3]], 'views': cnt['view'], 'pois': [[k, nm] for k, nm in named[:6]]}
    h['land'] = land

    # ---------- textes
    kind_fr = 'Boucle' if h['loop'] else 'Itinéraire'
    kind_nl = 'Lus' if h['loop'] else 'Route'
    f = land['forest']
    if f >= 70: pf, pn = 'essentiellement forestière', 'grotendeels door het bos'
    elif f >= 45: pf, pn = 'partagée entre forêt et campagne', 'afwisselend door bos en open landschap'
    elif f >= 20: pf, pn = 'plutôt à découvert, avec quelques passages en sous-bois', 'eerder open, met enkele stukken door het bos'
    else: pf, pn = 'à découvert, entre prés et champs', 'door open landschap, tussen weiden en velden'
    if h['kind'] == 'velo': pf, pn = pf.replace('forestière', 'forestière'), pn
    fr = [f"{kind_fr} de {fmt(h['km'])} km {pf} ({f} % en forêt)."]
    nl = [f"{kind_nl} van {fmt(h['km'])} km, {pn} ({f} % bos)."]
    top = sorted([('sentier', land['sentier']), ('chemin', land['chemin']), ('route', land['route'])], key=lambda x: -x[1])
    SF = {'sentier': 'sentiers', 'chemin': 'chemins forestiers et agricoles', 'route': 'petites routes'}
    SN = {'sentier': 'smalle paadjes', 'chemin': 'bos- en veldwegen', 'route': 'rustige wegen'}
    if top[0][1] >= 60:
        fr.append(f"On marche surtout sur des {SF[top[0][0]]} ({top[0][1]} %)."); nl.append(f"U wandelt vooral over {SN[top[0][0]]} ({top[0][1]} %).")
    else:
        fr.append(f"Le parcours alterne {SF[top[0][0]]} ({top[0][1]} %) et {SF[top[1][0]]} ({top[1][1]} %).")
        nl.append(f"Het parcours wisselt {SN[top[0][0]]} ({top[0][1]} %) af met {SN[top[1][0]]} ({top[1][1]} %).")
    if villages:
        v = villages[:4]
        fr.append(("Le parcours passe par " if len(v) == 1 else "Le parcours traverse ") + join(v, 'et') + ('.' if len(villages) <= 4 else ', entre autres.'))
        nl.append(("Onderweg komt u door " + join(v, 'en')) + ('.' if len(villages) <= 4 else ', onder meer.'))
    else:
        fr.append("Aucun village sur le trajet : calme et nature garantis."); nl.append("Geen dorpen onderweg: rust en natuur gegarandeerd.")
    long_r = [(nm, km) for nm, km in riv if km >= 0.4]
    short_r = [nm for nm, km in riv if km < 0.4]
    if long_r:
        nm, km = long_r[0]
        art = lambda x: ('la ' + x) if x in ('Semois', 'Vierre', 'Rulles', 'Chiers', 'Marche') else (('le ' + x[0].lower() + x[1:]) if x.lower().startswith(('ruisseau', 'rau')) else ('le ' + x))
        fr.append(f"On longe {art(nm)} sur environ {fmt(km)} km" + (f", puis {join([art(x) for x, _ in long_r[1:3]], 'et')}" if len(long_r) > 1 else '') + '.')
        nl.append(f"De route volgt de {nm} over ongeveer {fmt(km)} km" + (f", en ook de {join([x for x, _ in long_r[1:3]], 'en')}" if len(long_r) > 1 else '') + '.')
    elif short_r:
        fr.append(f"On franchit {join(short_r[:2], 'et')}."); nl.append(f"De route steekt de {join(short_r[:2], 'en')} over.")
    up = h['up']; ratio = up / max(h['km'], .1)
    if ratio < 12: fr.append(f"Peu de dénivelé (+{up} m) : idéal en famille."); nl.append(f"Weinig hoogteverschil (+{up} m): ideaal voor gezinnen.")
    elif ratio < 25: fr.append(f"Quelques montées (+{up} m au total)."); nl.append(f"Enkele hellingen (+{up} m in totaal).")
    else: fr.append(f"Des côtes soutenues (+{up} m) : prévoir de bonnes jambes."); nl.append(f"Stevige klimmen (+{up} m): goede conditie aanbevolen.")
    PF = {'view': 'point de vue', 'chapel': 'chapelle', 'ruins': 'ruines', 'heritage': 'patrimoine', 'rock': 'rocher', 'cave': 'grotte', 'spring': 'source', 'tower': 'tour', 'castle': 'château'}
    PN = {'view': 'uitzichtpunt', 'chapel': 'kapel', 'ruins': 'ruïnes', 'heritage': 'erfgoed', 'rock': 'rots', 'cave': 'grot', 'spring': 'bron', 'tower': 'toren', 'castle': 'kasteel'}
    nm_pois = [(k, nm) for k, nm in named if k in ('view', 'ruins', 'castle', 'rock', 'cave', 'chapel', 'tower', 'spring')][:3]
    if nm_pois:
        fr.append("À voir en chemin : " + join([nm if re.match(r'(?i)(église|chapelle|château|tour|grotte|rocher|source|point de vue|ruines)', nm) else f"{nm} ({PF[k]})" for k, nm in nm_pois], 'et') + '.')
        nl.append("Onderweg te zien: " + join([nm if re.match(r'(?i)(église|chapelle|château|tour|grotte|rocher|source|point de vue|ruines)', nm) else f"{nm} ({PN[k]})" for k, nm in nm_pois], 'en') + '.')
    elif cnt['view']:
        fr.append(f"{cnt['view']} point{'s' if cnt['view'] > 1 else ''} de vue en chemin."); nl.append(f"{cnt['view']} uitzichtpunt{'en' if cnt['view'] > 1 else ''} onderweg.")
    h['desc'] = {'fr': ' '.join(fr), 'nl': ' '.join(nl)}

open(HJS, 'w', encoding='utf-8').write(head + 'window.HIKES = ' + json.dumps(hikes, ensure_ascii=False, separators=(',', ':')) + ';\n')
for h in hikes[:6]: print('-', h['name'], ':', h['desc']['fr'])
print(len(hikes), 'balades décrites ;', sum(1 for h in hikes if h['land']['forest'] >= 70), 'surtout forestières')
