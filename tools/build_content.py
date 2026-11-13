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

# Version néerlandaise (tools/i18n/nl_*.json, alignée par index sur le français)
I = os.path.join(D, 'i18n')
if os.path.exists(os.path.join(I, 'nl_a.json')):
    a, b, c = (json.load(open(os.path.join(I, f), encoding='utf-8')) for f in ('nl_a.json', 'nl_b.json', 'nl_c.json'))
    nl = {'events': a['events'], 'places': a['places'], 'history': b['history'], 'culture': b['culture'],
          'specialties': c['specialties'], 'recipes': c['recipes'], 'producers': c['producers'], 'restaurants': c['restaurants']}
    for k in ('events', 'places', 'culture', 'specialties', 'recipes', 'producers', 'restaurants'):
        assert len(nl[k]) == len(out[k]), k
    js = '// Généré par tools/build_content.py (traduction NL de tools/i18n/nl_*.json)\nwindow.CONTENT_NL = ' + json.dumps(nl, ensure_ascii=False) + ';\n'
    open(os.path.join(D, '..', 'data', 'content.nl.js'), 'w', encoding='utf-8').write(js)
    print('NL ok')
