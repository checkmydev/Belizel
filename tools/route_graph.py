"""Reconstitue le tracé continu d'une relation OSM de randonnée.

Les membres d'une relation ne sont pas toujours rangés dans l'ordre, et la relation peut contenir
des allers-retours (excursions vers un point de vue), des variantes et des accès. On construit
le graphe des chemins, on double les impasses (aller-retour) puis on parcourt chaque tronçon
une fois (circuit eulérien), en suivant au mieux l'ordre de la relation.
"""
import heapq, math
from collections import defaultdict

SKIP_ROLES = {'alternative', 'approach', 'connection'}

def dist(a, b):
    R = 6371000; r = math.radians
    h = math.sin(r(b[0]-a[0])/2)**2 + math.cos(r(a[0]))*math.cos(r(b[0]))*math.sin(r(b[1]-a[1])/2)**2
    return 2*R*math.asin(math.sqrt(h))

def _key(p): return (round(p[0], 6), round(p[1], 6))

def route_line(members):
    """members : liste de (role, [(lat, lon), ...]) dans l'ordre de la relation. Renvoie [(lat, lon), ...]."""
    main = [(r, w) for r, w in members if len(w) >= 2 and r not in SKIP_ROLES]
    if not main: main = [(r, w) for r, w in members if len(w) >= 2]
    if not main: return []
    edges = []                         # (u, v, longueur, indice du membre)
    adj = defaultdict(list)
    for mi, (_, w) in enumerate(main):
        for a, b in zip(w, w[1:]):
            u, v = _key(a), _key(b)
            if u == v: continue
            adj[u].append(len(edges)); adj[v].append(len(edges))
            edges.append([u, v, dist(a, b), mi])
    # composantes connexes ; on écarte les petits morceaux isolés (erreurs de saisie)
    comp = {}; comps = []
    for n in adj:
        if n in comp: continue
        stack = [n]; comp[n] = len(comps); nodes = []
        while stack:
            x = stack.pop(); nodes.append(x)
            for e in adj[x]:
                y = edges[e][1] if edges[e][0] == x else edges[e][0]
                if y not in comp: comp[y] = len(comps); stack.append(y)
        comps.append(nodes)
    clen = [0.0]*len(comps)
    for u, v, l, _ in edges: clen[comp[u]] += l
    big = max(clen)
    keep = [c for c in range(len(comps)) if clen[c] >= 0.2*big]
    # ordre des composantes : celui de leur premier membre dans la relation
    first = {}
    for u, v, l, mi in edges:
        c = comp[u]; first[c] = min(first.get(c, mi), mi)
    keep.sort(key=lambda c: first[c])
    line = []
    for c in keep:
        part = _euler(c, comp, comps[c], adj, edges)
        if line and part and dist(line[-1], part[-1]) < dist(line[-1], part[0]): part.reverse()
        line += part
    return line

def _dijkstra(src, targets, adj, edges, nodes_ok):
    d = {src: 0}; prev = {}; pq = [(0, src)]
    while pq:
        dd, x = heapq.heappop(pq)
        if dd > d[x]: continue
        if x in targets and x != src: 
            path = []; y = x
            while y != src: path.append(prev[y]); e = prev[y]; y = edges[e][0] if edges[e][1] == y else edges[e][1]
            return x, dd, path
        for e in adj[x]:
            y = edges[e][1] if edges[e][0] == x else edges[e][0]
            nd = dd + edges[e][2]
            if nd < d.get(y, 1e18): d[y] = nd; prev[y] = e; heapq.heappush(pq, (nd, y))
    return None, None, []

def _euler(c, comp, nodes, adj, edges):
    nodes_ok = set(nodes)
    total = sum(edges[e][2] for n in nodes for e in adj[n]) / 2
    ad = {n: list(adj[n]) for n in nodes}
    E = [list(e) for e in edges]
    odd = [n for n in nodes if len(ad[n]) % 2]
    # appariement glouton des impasses : on double le plus court chemin entre deux sommets impairs
    odd_set = set(odd); linear_ends = None
    while len(odd_set) > 0:
        if len(odd_set) == 2:
            a, b = list(odd_set)
            _, dd, path = _dijkstra(a, {b}, ad, E, nodes_ok)
            if dd is not None and dd > 0.3*total: linear_ends = (a, b); break  # vrai itinéraire linéaire
        best = None
        for a in odd_set:
            t, dd, path = _dijkstra(a, odd_set - {a}, ad, E, nodes_ok)
            if t is not None and (best is None or dd < best[1]): best = (a, dd, path, t)
        if best is None: break
        a, dd, path, t = best
        for e in path:
            u, v, l, mi = E[e]; E.append([u, v, l, mi]); k = len(E)-1
            ad[u].append(k); ad[v].append(k)
        odd_set -= {a, t}
    # Hierholzer, en préférant l'ordre des membres de la relation
    used = [False]*len(E)
    start_edge = min((e for n in nodes for e in ad[n]), key=lambda e: E[e][3])
    start = linear_ends[0] if linear_ends else E[start_edge][0]
    if linear_ends:   # partir de l'extrémité la plus proche du premier membre
        s0 = E[start_edge][0]
        a, b = linear_ends
        start = a if dist(a, s0) <= dist(b, s0) else b
    stack = [(start, None)]; out = []
    while stack:
        x, mi = stack[-1]
        cand = [e for e in ad[x] if not used[e]]
        if cand:
            cur = mi if mi is not None else E[start_edge][3]
            e = min(cand, key=lambda e: (E[e][3] < cur, abs(E[e][3]-cur)))
            used[e] = True
            y = E[e][1] if E[e][0] == x else E[e][0]
            stack.append((y, E[e][3]))
        else:
            out.append(x); stack.pop()
    out.reverse()
    return [tuple(p) for p in out]
