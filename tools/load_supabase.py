"""Charge les données locales dans Supabase (schéma belizel) avec la clé service_role (jamais affichée).
Usage : python tools/load_supabase.py [comps] [finance] [manual] [stories]   (sans argument : tout)
- comps   : data/comps.js → nouvel instantané comps_snapshots
- finance : data/finance-demo.js → bookings / expenses (remplace les lignes demo=true)
- manual  : data/manual.js → manual (id=1), code invité conservé s'il existe
- stories : data/stories.js → content['stories']
"""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
import sb
D = os.path.join(os.path.dirname(__file__), '..', 'data')

def js_obj(name):
    s = open(os.path.join(D, name), encoding='utf-8').read()
    s = re.sub(r'^\s*//.*$', '', s, flags=re.M)
    body = s[s.index('=') + 1: s.rindex(';')].strip()
    try: return json.loads(body)
    except json.JSONDecodeError:  # objets JS « à la main » (manual.js, stories.js) : passage par node
        import subprocess
        out = subprocess.run(['node', '-e', f"const window={{}};{s};console.log(JSON.stringify(Object.values(window)[0]))"], capture_output=True, text=True, check=True)
        return json.loads(out.stdout)

what = set(sys.argv[1:]) or {'comps', 'finance', 'manual', 'stories'}
if 'comps' in what:
    c = js_obj('comps.js'); sb.rest('POST', '/rest/v1/comps_snapshots', {'scraped': c['scraped'], 'data': c})
    print('comps : instantané', c['scraped'], len(c['listings']), 'annonces')
if 'finance' in what:
    f = js_obj('finance-demo.js')
    sb.rest('DELETE', '/rest/v1/bookings?demo=eq.true'); sb.rest('DELETE', '/rest/v1/expenses?demo=eq.true')
    bk = [{'ext_ref': b['id'], 'guest': b['guest'], 'checkin': b['checkin'], 'nights': b['nights'], 'guests': b['guests'], 'gross': b['gross'],
           'cleaning': b['cleaning'], 'fee': b['fee'], 'payout': b['payout'], 'tourist_tax': b['touristTax'], 'status': b['status'], 'source': b['source'], 'demo': True} for b in f['bookings']]
    ex = [{'date': e['date'], 'category': e['cat'], 'label': e['label'], 'amount': e['amount'], 'recurring': e['recurring'], 'demo': True} for e in f['expenses']]
    sb.rest('POST', '/rest/v1/bookings', bk); sb.rest('POST', '/rest/v1/expenses', ex)
    print('finances :', len(bk), 'réservations,', len(ex), 'dépenses (exemple)')
if 'manual' in what:
    m = js_obj('manual.js')
    cur = sb.rest('GET', '/rest/v1/manual?id=eq.1&select=guest_code', prefer='return=representation')
    row = {'id': 1, 'data': m}
    if not cur: row['guest_code'] = 'IZEL2027'
    sb.rest('POST', '/rest/v1/manual?on_conflict=id', row, prefer='resolution=merge-duplicates,return=minimal')
    print('mode d\'emploi chargé')
if 'stories' in what:
    s = js_obj('stories.js')
    sb.rest('POST', '/rest/v1/content?on_conflict=key', {'key': 'stories', 'data': s}, prefer='resolution=merge-duplicates,return=minimal')
    print('histoires :', len(s))
