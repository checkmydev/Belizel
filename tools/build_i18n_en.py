"""Version anglaise du guide : génère js/i18n.en.js (dictionnaire et règles de l'interface)
et ajoute les blocs anglais à data/listing.js, data/manual.js et data/stories.js.
Sources : tools/i18n/src/ui_en.json, rules_en.json, small_en.json. Relançable sans risque (les blocs EN sont remplacés).
Usage : python tools/build_i18n_en.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'tools', 'i18n', 'src')
load = lambda f: json.load(open(os.path.join(SRC, f), encoding='utf-8'))
J = lambda o: json.dumps(o, ensure_ascii=False, indent=1)

ui, rules, small = load('ui_en.json'), load('rules_en.json'), load('small_en.json')
js = ('// Généré par tools/build_i18n_en.py — interface du guide en anglais (dictionnaire FR → EN et règles pour les textes avec nombres)\n'
      'window.I18N_EN = {dict: ' + json.dumps(ui, ensure_ascii=False) + ',\nrules: ' + json.dumps(rules, ensure_ascii=False) + '};\n')
open(os.path.join(ROOT, 'js', 'i18n.en.js'), 'w', encoding='utf-8').write(js)

def put_block(fname, code):
    p = os.path.join(ROOT, 'data', fname); s = open(p, encoding='utf-8').read()
    s = re.sub(r'\n// EN-BEGIN.*?// EN-END\n', '\n', s, flags=re.S).rstrip('\n') + '\n'
    s += '\n// EN-BEGIN — version anglaise (générée par tools/build_i18n_en.py, alignée par index sur le français)\n' + code + '\n// EN-END\n'
    open(p, 'w', encoding='utf-8').write(s)

put_block('listing.js', 'window.LISTING.en = ' + J(small['listing_en']) + ';')
put_block('manual.js', 'window.MANUAL.en = ' + J(small['manual_en']) + ';')
put_block('stories.js', 'window.STORIES_EN = ' + J(small['stories_en']) + ';')
print(len(ui), 'textes d\'interface,', len(rules), 'règles ; blocs EN écrits dans listing.js, manual.js, stories.js')
