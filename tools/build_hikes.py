"""Construit data/hikes.js à partir d'un export Overpass (relations route=hiking|foot|bicycle avec `out geom;`).
Altitudes : OpenTopoData, EU-DEM 25 m. Tracés : © contributeurs OpenStreetMap (ODbL).
Usage : python tools/build_hikes.py geom.json
"""
import json, math, sys, os, time, urllib.request, urllib.parse
HOUSE = (49.6913, 5.3794)
OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'hikes.js')

def dist(a, b):
    R = 6371000; r = math.radians
    h = math.sin(r(b[0]-a[0])/2)**2 + math.cos(r(a[0]))*math.cos(r(b[0]))*math.sin(r(b[1]-a[1])/2)**2
    return 2*R*math.asin(math.sqrt(h))

def chain(ways):
    ways = [w for w in ways if len(w) >= 2]
    if not ways: return []
    # ordre de la relation, chaque segment orienté pour coller au précédent ; sinon plus proche voisin
    used = [False]*len(ways); line = list(ways[0]); used[0] = True
    if len(ways) > 1:
        nxt = ways[1]
        if min(dist(line[0], nxt[0]), dist(line[0], nxt[-1])) < min(dist(line[-1], nxt[0]), dist(line[-1], nxt[-1])):
            line.reverse()
    for _ in range(len(ways)-1):
        end = line[-1]; best = None
        for j, w in enumerate(ways):
            if used[j]: continue
            for rev in (False, True):
                p = w[-1] if rev else w[0]; d = dist(end, p)
                if best is None or d < best[0]: best = (d, j, rev)
        d, j, rev = best; used[j] = True
        w = ways[j][::-1] if rev else ways[j]
        line += w[1:] if d < 5 else w
    return line

def dp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0
    ax, ay = a[1]*math.cos(math.radians(a[0]))*111320, a[0]*110540
    bx, by = b[1]*math.cos(math.radians(b[0]))*111320, b[0]*110540
    for i in range(1, len(pts)-1):
        px, py = pts[i][1]*math.cos(math.radians(pts[i][0]))*111320, pts[i][0]*110540
        dx, dy = bx-ax, by-ay; L = dx*dx+dy*dy
        t = 0 if L == 0 else max(0, min(1, ((px-ax)*dx+(py-ay)*dy)/L))
        d = math.hypot(px-(ax+t*dx), py-(ay+t*dy))
        if d > dmax: dmax, idx = d, i
    if dmax > eps: return dp(pts[:idx+1], eps)[:-1] + dp(pts[idx:], eps)
    return [a, b]

def elevations(pts):
    """Altitudes EU-DEM 25 m via OpenTopoData (100 points/requête, 1 requête/s)."""
    out = []
    for k in range(0, len(pts), 100):
        chunk = pts[k:k+100]
        q = '|'.join(f'{p[0]:.5f},{p[1]:.5f}' for p in chunk)
        for attempt in range(5):
            try:
                with urllib.request.urlopen('https://api.opentopodata.org/v1/eudem25m?locations=' + q, timeout=40) as r:
                    out += [x['elevation'] for x in json.load(r)['results']]; break
            except Exception as e:
                time.sleep(3*(attempt+1))
        else:
            out += [None]*len(chunk)
        time.sleep(1.1)
    return out

COLORS = {'red':'#c4552c','blue':'#3c6e7c','green':'#4f7a3a','yellow':'#c99a2e','purple':'#7a4f8a','white':'#8a8473','grey':'#6b6b6b','black':'#333'}

def main(src):
    data = json.load(open(src, encoding='utf-8'))
    hikes = []
    for rel in data['elements']:
        t = rel.get('tags', {})
        ways = [[(g['lat'], g['lon']) for g in m['geometry']] for m in rel.get('members', []) if m.get('type') == 'way' and m.get('geometry')]
        line = chain(ways)
        if len(line) < 2: continue
        L = sum(dist(line[i], line[i+1]) for i in range(len(line)-1)) / 1000
        kind = 'velo' if t.get('route') in ('bicycle', 'mtb') else 'pied'
        if kind == 'pied' and not (2 <= L <= 26): continue
        if kind == 'velo' and not (5 <= L <= 60): continue
        start = line[0]
        loop = dist(line[0], line[-1]) < 400
        # point le plus proche de la maison comme point de départ conseillé si boucle
        near_i = min(range(len(line)), key=lambda i: dist(HOUSE, line[i]))
        if loop and near_i:
            line = line[near_i:] + line[1:near_i+1]; start = line[0]
        dkm = dist(HOUSE, start)/1000
        nearest = dist(HOUSE, line[near_i])/1000
        if nearest > 17: continue
        simp = dp(line, 8)
        if len(simp) > 700: simp = dp(line, 20)
        # échantillonnage régulier pour les altitudes (≈ tous les 100 m, max 200 points)
        n = int(min(200, max(30, L*10))); cum = [0]
        for i in range(1, len(simp)): cum.append(cum[-1] + dist(simp[i-1], simp[i]))
        samples = []; j = 0
        for k in range(n):
            target = cum[-1]*k/(n-1)
            while j < len(cum)-2 and cum[j+1] < target: j += 1
            seg = cum[j+1]-cum[j] or 1; f = (target-cum[j])/seg
            samples.append((simp[j][0]+(simp[j+1][0]-simp[j][0])*f, simp[j][1]+(simp[j+1][1]-simp[j][1])*f))
        ele = elevations(samples)
        if any(e is None for e in ele): ele_ok = False
        else: ele_ok = True
        up = down = 0
        if ele_ok:
            sm = [sum(ele[max(0,i-1):i+2])/len(ele[max(0,i-1):i+2]) for i in range(len(ele))]
            for i in range(1, len(sm)):
                d = sm[i]-sm[i-1]
                if d > 0: up += d
                else: down -= d
        hours = (L/4.2 + up/450) if kind == 'pied' else (L/15 + up/600)
        score = L + up/100
        diff = 'facile' if score < 8 else ('moyen' if score < 14 else 'sportif')
        if kind == 'velo': diff = 'facile' if up < 250 else ('moyen' if up < 600 else 'sportif')
        sym = t.get('osmc:symbol', '')
        col = COLORS.get(sym.split(':')[0], '#3c6e7c') if sym else ('#2f4a34' if kind == 'velo' else '#3c6e7c')
        name = t.get('name') or (('Itinéraire vélo ' + t.get('ref','')) if kind == 'velo' else t.get('ref', 'Balade'))
        hikes.append(dict(
            id=rel['id'], name=name.strip(), ref=t.get('ref'), operator=t.get('operator'), network=t.get('network'), kind=kind,
            symbol=sym, color=col, km=round(L, 1), up=round(up), down=round(down), minutes=int(round(hours*60/5)*5), diff=diff,
            loop=loop, start=[round(start[0], 5), round(start[1], 5)], fromHouse=round(dkm, 1), nearest=round(nearest, 1),
            ele=[round(e) for e in ele] if ele_ok else None, samples=[[round(p[0],5), round(p[1],5)] for p in samples],
            coords=[[round(p[0], 5), round(p[1], 5)] for p in simp], osm=f"https://www.openstreetmap.org/relation/{rel['id']}",
            web=t.get('website') or t.get('url'), desc=t.get('description') or t.get('note:fr')))
        print(f"{name[:45]:45} {L:5.1f} km  +{up:4.0f} m  {diff:8} départ à {dkm:4.1f} km  ({len(simp)} pts)")
    # dédoublonnage (même nom + même longueur)
    seen = set(); uniq = []
    for h in sorted(hikes, key=lambda h: (h['nearest'], h['km'])):
        k = (h['name'].lower(), round(h['km']))
        if k in seen: continue
        seen.add(k); uniq.append(h)
    js = '// Généré par tools/build_hikes.py — tracés © contributeurs OpenStreetMap (ODbL), altitudes EU-DEM (OpenTopoData)\nwindow.HIKES = ' + json.dumps(uniq, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(OUT, 'w', encoding='utf-8').write(js)
    print(len(uniq), 'itineraires ->', OUT, f'{len(js)//1024} Ko')

if __name__ == '__main__':
    main(sys.argv[1])
