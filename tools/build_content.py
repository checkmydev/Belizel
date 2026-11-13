"""Assemble les recherches (tools/research/*.json) en data/content.js."""
import json, os
D = os.path.dirname(__file__)
L = lambda f: json.load(open(os.path.join(D, 'research', f), encoding='utf-8'))
ep, hi, cc = L('events_places.json'), L('history.json'), L('culture_cuisine.json')
out = {'events': ep['events'], 'places': ep['places'], 'history': {k: hi[k] for k in ('timeline', 'sites', 'legends')},
       'specialties': cc['specialties'], 'recipes': cc['recipes'], 'producers': cc['producers'], 'restaurants': cc['restaurants'], 'culture': cc['culture']}
js = '// Généré par tools/build_content.py à partir de tools/research/*.json\nwindow.CONTENT = ' + json.dumps(out, ensure_ascii=False) + ';\n'
open(os.path.join(D, '..', 'data', 'content.js'), 'w', encoding='utf-8').write(js)
print({k: len(v) if isinstance(v, list) else len(v) for k, v in out.items()})
