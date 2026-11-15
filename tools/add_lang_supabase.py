"""Ajoute une langue (par défaut l'anglais) aux contenus éditables stockés dans Supabase, sans écraser
ce que le propriétaire a déjà saisi : le mode d'emploi reçoit `data.<lang>` seulement s'il n'existe pas encore,
et content['stories_<lang>'] n'est créé que s'il est absent.
Usage : python tools/add_lang_supabase.py [en]
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sb
sys.stdout.reconfigure(encoding='utf-8')
L = sys.argv[1] if len(sys.argv) > 1 else 'en'
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')

def js(name, expr):
    src = open(os.path.join(D, name), encoding='utf-8').read()
    out = subprocess.run(['node', '-e', f"const window={{}};{src};console.log(JSON.stringify({expr}))"], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(out.stdout)

man = sb.rest('GET', '/rest/v1/manual?id=eq.1&select=data', prefer='return=representation')
if man:
    data = man[0]['data']
    if L in data: print(f'mode d\'emploi : version {L} déjà présente, inchangée')
    else:
        data[L] = js('manual.js', f'window.MANUAL.{L}')
        sb.rest('PATCH', '/rest/v1/manual?id=eq.1', {'data': data})
        print(f'mode d\'emploi : version {L} ajoutée ({len(data[L]["sections"])} rubriques)')
else: print('mode d\'emploi : aucune ligne en base (rien à faire)')

key = 'stories_' + L
cur = sb.rest('GET', f'/rest/v1/content?key=eq.{key}&select=key', prefer='return=representation')
if cur: print(f'{key} : déjà présent, inchangé')
else:
    st = js('stories.js', f'window.STORIES_{L.upper()}')
    sb.rest('POST', '/rest/v1/content', {'key': key, 'data': [{'year': x['year'], 'title': x['title'], 'text': x['text']} for x in st]})
    print(f'{key} : {len(st)} histoires ajoutées')
