"""Construit data/comps.js à partir de comps_full.json (sortie de search.py + details.py).
Usage : python tools/search.py comps.json && python tools/details.py comps.json comps_full.json && python tools/build_comps.py comps_full.json
"""
import json,re,sys,datetime,os
SELF='844929788475952833'
SCEN={'hiver_semaine':{'label':'Hiver · semaine','dates':'4–6 janv. 2027','nights':2},
      'printemps_we':{'label':'Printemps · week-end','dates':'16–18 avr. 2027','nights':2},
      'ete_semaine':{'label':'Été · semaine complète','dates':'17–24 juil. 2027','nights':7},
      'automne_we':{'label':'Automne · week-end','dates':'15–17 oct. 2027','nights':2}}
MAP=[(r'^Sauna',"Sauna"),(r'^Jacuzzi',"Jacuzzi"),(r'^(Cheminée|Cheminée ou poêle)',"Feu de bois / poêle"),(r'^(Télévision|TV)',"Télévision"),
 (r'^(Lit pour bébé|Lit parapluie)',"Lit bébé"),(r'^Chaise haute',"Chaise haute"),(r'^Barbecue',"Barbecue"),(r'^(Jardin|Arrière-cour)',"Jardin"),
 (r'^(Privé\s*: patio|Patio ou balcon)',"Terrasse / patio"),(r'^Lave-linge',"Lave-linge"),(r'^Sèche-linge',"Sèche-linge"),(r'^Livres et jouets pour enfants',"Jouets enfants"),
 (r'^Cafetière',"Cafetière"),(r'^(Chauffage central|Chauffage$)',"Chauffage"),(r'^Climatis|^Climatiseur',"Climatisation"),(r'^Stationnement gratuit sur place',"Parking sur place"),
 (r'^Arrivée autonome',"Arrivée autonome"),(r'^Animaux acceptés',"Animaux acceptés"),(r'^(Vue sur la rivière|Accès à un lac|Bord de)',"Eau / rivière"),
 (r'^Billard',"Billard"),(r'^Table de ping-pong',"Ping-pong"),(r'^(Aire de jeux|Salle de jeux)',"Jeux enfants"),(r'^Brasero',"Brasero"),
 (r'^Espace de travail',"Espace de travail"),(r'^Wifi',"Wifi"),(r'^Lave-vaisselle',"Lave-vaisselle"),(r'^Baignoire$',"Baignoire"),(r'^Jeux de société',"Jeux de société"),
 (r'^Café$',"Café offert"),(r'^Produits de base',"Produits de base"),(r'^Entrée privée',"Entrée privée"),(r'^Vue sur',"Belle vue"),(r'^Borne de recharge|^Chargeur pour véhicules',"Borne VE"),
 (r'^Enceinte|^Système audio',"Enceinte Bluetooth"),(r'^Piscine',"Piscine")]
def norm(a):
    for p,n in MAP:
        if re.search(p,a): return n
    return None
d=json.load(open(sys.argv[1],encoding='utf-8'))
out=[]
for e in d:
    am=sorted({n for a in e.get('amen',[]) if (n:=norm(a))})
    out.append(dict(id=e['id'],self=e['id']==SELF,name=(e['name'] or '').replace('\n',' ').strip(),type=e['type'].split('⋅')[0].strip(),
      town=e['type'].split('⋅')[-1].strip(),lat=e['lat'],lng=e['lng'],km=e.get('km'),rating=e['rating'],reviews=e['reviews'],
      superhost=e.get('superhost'),guestFav=('Coup de cœur voyageurs' in e['badges']),cap=e.get('capacity'),
      info=[i for i in e['info'] if i],photo=e.get('photo'),prices=e['prices'],cats=e.get('cats') or {},tags=e.get('tags') or {},amen=am,
      pro='Professionnel' in e['info']))
js='// Généré par tools/build_comps.py — ne pas éditer à la main\nwindow.COMPS = '+json.dumps({'scraped':datetime.date.today().isoformat(),'scenarios':SCEN,'self':SELF,'listings':out},ensure_ascii=False)+';\n'
open(os.path.join(os.path.dirname(__file__),'..','data','comps.js'),'w',encoding='utf-8').write(js)
print(len(out),'annonces')
