"""Accès Supabase pour Belizel (projet partagé wzrcrszfubjsfoaxatvo, schéma `belizel`).
Lit SUPABASE_ACCESS_TOKEN dans .env ; ne jamais afficher les clés."""
import os, json, urllib.request
REF = 'wzrcrszfubjsfoaxatvo'
URL = f'https://{REF}.supabase.co'
def _env():
    p = os.path.join(os.path.dirname(__file__), '..', '.env'); e = {}
    for line in open(p, encoding='utf-8'):
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.strip().split('=', 1); e[k] = v
    return e
ENV = _env()
def mgmt(method, path, body=None):
    req = urllib.request.Request('https://api.supabase.com/v1' + path, method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={'Authorization': 'Bearer ' + ENV['SUPABASE_ACCESS_TOKEN'], 'Content-Type': 'application/json', 'User-Agent': 'belizel-tools'})
    with urllib.request.urlopen(req, timeout=60) as r:
        t = r.read().decode(); return json.loads(t) if t else None
def sql(q):
    return mgmt('POST', f'/projects/{REF}/database/query', {'query': q})
_keys = None
def keys():
    global _keys
    if _keys is None:
        _keys = {k['name']: k['api_key'] for k in mgmt('GET', f'/projects/{REF}/api-keys') if k.get('name') in ('anon', 'service_role')}
    return _keys
def rest(method, path, body=None, prefer='return=minimal', schema='belizel'):
    k = keys()['service_role']
    h = {'apikey': k, 'Authorization': 'Bearer ' + k, 'Content-Type': 'application/json', 'Prefer': prefer,
         'Accept-Profile': schema, 'Content-Profile': schema}
    req = urllib.request.Request(URL + path, method=method, data=None if body is None else json.dumps(body).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=60) as r:
        t = r.read().decode(); return json.loads(t) if t else None
