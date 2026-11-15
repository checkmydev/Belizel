// Mode d'emploi de la maison.
// ⚠ CONTENU D'EXEMPLE : valeurs plausibles générées pour visualiser l'application.
// À valider ou corriger par le propriétaire, ici ou depuis l'espace admin (onglet « Mode d'emploi »), qui exporte ce fichier.
window.MANUAL = {
  demo: true,
  updated: "2026-11-13",
  wifi: { ssid: "Belizel-Invites", password: "Semois-2027" },
  sections: [
    { id: "arrivee", icon: "key", title: "Arrivée", items: [
      { q: "Heure d'arrivée", a: "À partir de 16 h. Une arrivée plus tôt est souvent possible : demandez-nous la veille." },
      { q: "Récupérer les clés", a: "Boîte à clés à gauche de la porte d'entrée, côté rue. Le code vous est envoyé par message Airbnb le jour de l'arrivée." },
      { q: "Stationnement", a: "Parking gratuit devant la maison (2 voitures), et stationnement gratuit dans la rue." },
      { q: "Itinéraire", a: "Depuis la N83, prenez la direction Izel centre. La maison est la façade ocre, à deux pas de l'église." }
    ]},
    { id: "chauffage", icon: "flame", title: "Chauffage et poêle à bois", items: [
      { q: "Chauffage central", a: "Thermostat dans le living, à côté de la porte de la cuisine. Réglage conseillé : 20 °C le jour, 17 °C la nuit. Chaque chambre a sa vanne thermostatique." },
      { q: "Allumer le poêle", a: "1. Ouvrez à fond la tirette d'air sous la porte. 2. Deux bûchettes en croix, un allume-feu au centre, deux petites bûches par-dessus. 3. Allumez, laissez la porte entrouverte 5 minutes, puis refermez. 4. Quand le feu est bien pris, réduisez l'arrivée d'air de moitié." },
      { q: "Bois de chauffage", a: "Un panier de bois sec est prêt à votre arrivée. Le stock se trouve sous l'abri, au fond de la terrasse : servez-vous raisonnablement." },
      { q: "Sécurité", a: "Détecteurs de fumée et de monoxyde de carbone présents. Ne laissez jamais le poêle sans surveillance avec la porte ouverte, et videz les cendres uniquement à froid, dans le seau métallique." }
    ]},
    { id: "cuisine", icon: "chef", title: "Cuisine et électroménager", items: [
      { q: "Lave-vaisselle", a: "Pastilles sous l'évier. Programme « Eco 50° » conseillé (3 h 30)." },
      { q: "Lave-linge", a: "Dans la salle de douche du rez-de-chaussée. Lessive fournie pour une machine. Étendoir dans le placard sous l'escalier." },
      { q: "Cafetière", a: "Cafetière filtre et bouilloire. Un premier paquet de café et quelques sachets de thé vous attendent." },
      { q: "Barbecue", a: "Barbecue au charbon de bois sur la terrasse. Charbon et allume-feu dans l'abri. Laissez refroidir avant de le couvrir." }
    ]},
    { id: "multimedia", icon: "music", title: "Wifi et multimédia", items: [
      { q: "Wifi", a: "Scannez le QR code ci-dessus pour vous connecter automatiquement. La fibre couvre toute la maison, combles compris." },
      { q: "Enceinte Bluetooth JBL", a: "Sur le petit bar du living. Allumez-la, puis sélectionnez « JBL Charge » dans le Bluetooth de votre téléphone." },
      { q: "Espace de travail", a: "Bureau sous les toits, avec lampe et prise à proximité : idéal pour télétravailler au calme." }
    ]},
    { id: "dechets", icon: "recycle", title: "Déchets et tri", items: [
      { q: "Poubelles", a: "Conteneurs à puce (gris : résiduel, vert : organique) le long de la façade arrière. Collecte le mardi matin : sortez-les le lundi soir si votre séjour couvre ce jour-là." },
      { q: "Tri sélectif", a: "PMC dans les sacs bleus (sous l'évier). Verre et papier-carton : dans les caisses de l'abri. Nous nous chargeons du dépôt au recyparc." }
    ]},
    { id: "regles", icon: "house", title: "Règles de la maison", items: [
      { q: "Animaux", a: "Les animaux ne sont pas admis." },
      { q: "Tabac", a: "Maison non-fumeur. Un cendrier est à disposition sur la terrasse." },
      { q: "Calme", a: "Izel est un village paisible : merci de respecter le voisinage après 22 h, surtout au jardin." },
      { q: "Bébé", a: "Un lit bébé est toujours disponible dans la grande chambre. Pensez à apporter votre propre linge pour bébé." }
    ]},
    { id: "depart", icon: "door", title: "Départ", items: [
      { q: "Heure de départ", a: "Avant 11 h. Un départ tardif est parfois possible : demandez-le-nous." },
      { q: "Avant de partir", a: "Lancez le lave-vaisselle, rassemblez les draps utilisés au pied des lits, sortez les poubelles, vérifiez que le poêle est éteint, fermez les fenêtres et remettez la clé dans la boîte à clés. Le ménage est compris !" }
    ]},
    { id: "urgences", icon: "phone", title: "Contacts et urgences", items: [
      { q: "Urgences", a: "112 (ambulance, pompiers) · 101 (police) · Centre antipoisons : 070 245 245" },
      { q: "Hôte", a: "Via la messagerie Airbnb (réponse en moins d'une heure). En cas d'urgence : le numéro de téléphone figure sur le panneau de l'entrée." },
      { q: "Pharmacie de garde", a: "pharmacie.be, ou 0903 99 000" },
      { q: "Médecin et hôpital", a: "Maison médicale à Florenville (10 min). Hôpital : Vivalia, Clinique Sud-Luxembourg à Arlon (35 min) ou CH de l'Ardenne à Libramont (40 min)." },
      { q: "Commerces", a: "Boulangerie et supérette à Jamoigne (5 min). Supermarchés à Florenville (10 min)." }
    ]}
  ]
};

// Nederlandse versie (zelfde structuur en volgorde ; wifi gedeeld)
window.MANUAL.nl = { sections: [
  { id: "arrivee", icon: "key", title: "Aankomst", items: [
    { q: "Aankomstuur", a: "Vanaf 16 uur. Vroeger aankomen kan vaak: vraag het ons de dag voordien." },
    { q: "Sleutels ophalen", a: "Sleutelkastje links van de voordeur, aan de straatkant. De code krijgt u via Airbnb op de dag van aankomst." },
    { q: "Parkeren", a: "Gratis parking voor het huis (2 wagens) en gratis parkeren in de straat." },
    { q: "Route", a: "Neem vanaf de N83 de richting Izel centrum. Het huis is de okerkleurige gevel, vlak bij de kerk." } ]},
  { id: "chauffage", icon: "flame", title: "Verwarming en houtkachel", items: [
    { q: "Centrale verwarming", a: "Thermostaat in de leefruimte, naast de keukendeur. Aanbevolen: 20 °C overdag, 17 °C 's nachts. Elke kamer heeft een thermostatische kraan." },
    { q: "De kachel aansteken", a: "1. Zet de luchttoevoer onder de deur volledig open. 2. Twee aanmaakhoutjes kruiselings, een aanmaakblokje in het midden, twee kleine blokken erbovenop. 3. Aansteken, de deur 5 minuten op een kier laten en dan sluiten. 4. Brandt het vuur goed, zet de luchttoevoer half dicht." },
    { q: "Brandhout", a: "Bij aankomst staat een mand droog hout klaar. De voorraad ligt onder het afdak achteraan het terras: bedien u met mate." },
    { q: "Veiligheid", a: "Rook- en CO-melders aanwezig. Laat de kachel nooit onbewaakt met open deur, en haal de as enkel koud weg, in de metalen emmer." } ]},
  { id: "cuisine", icon: "chef", title: "Keuken en toestellen", items: [
    { q: "Vaatwasser", a: "Tabletten onder de gootsteen. Programma « Eco 50° » aanbevolen (3,5 uur)." },
    { q: "Wasmachine", a: "In de douchekamer op het gelijkvloers. Waspoeder voor één wasbeurt voorzien. Droogrek in de kast onder de trap." },
    { q: "Koffiezetapparaat", a: "Filterkoffiezetapparaat en waterkoker. Een eerste pak koffie en wat theezakjes staan klaar." },
    { q: "Barbecue", a: "Houtskoolbarbecue op het terras. Houtskool en aanmaakblokjes onder het afdak. Laat afkoelen voor u hem afdekt." } ]},
  { id: "multimedia", icon: "music", title: "Wifi en multimedia", items: [
    { q: "Wifi", a: "Scan de QR-code hierboven om automatisch verbinding te maken. De glasvezel dekt het hele huis, zolder inbegrepen." },
    { q: "Bluetooth-luidspreker JBL", a: "Op de kleine bar in de leefruimte. Zet hem aan en kies « JBL Charge » in de Bluetooth van uw smartphone." },
    { q: "Werkplek", a: "Bureau onder het dak, met lamp en stopcontact: ideaal om rustig te telewerken." } ]},
  { id: "dechets", icon: "recycle", title: "Afval en sorteren", items: [
    { q: "Vuilnisbakken", a: "Containers met chip (grijs: restafval, groen: gft) langs de achtergevel. Ophaling op dinsdagochtend: zet ze maandagavond buiten als uw verblijf die dag omvat." },
    { q: "Sorteren", a: "PMD in de blauwe zakken (onder de gootsteen). Glas en papier-karton: in de bakken onder het afdak. Wij brengen ze naar het containerpark." } ]},
  { id: "regles", icon: "house", title: "Huisregels", items: [
    { q: "Huisdieren", a: "Huisdieren zijn niet toegelaten." },
    { q: "Roken", a: "Rookvrij huis. Op het terras staat een asbak." },
    { q: "Rust", a: "Izel is een rustig dorp: respecteer de buren na 22 uur, zeker in de tuin." },
    { q: "Baby", a: "In de grote kamer staat altijd een babybedje. Breng zelf linnen voor de baby mee." } ]},
  { id: "depart", icon: "door", title: "Vertrek", items: [
    { q: "Vertrekuur", a: "Vóór 11 uur. Later vertrekken kan soms: vraag het ons." },
    { q: "Voor u vertrekt", a: "Start de vaatwasser, leg het gebruikte beddengoed aan het voeteneind, zet het afval buiten, controleer of de kachel uit is, sluit de ramen en leg de sleutel terug in het sleutelkastje. De schoonmaak is inbegrepen!" } ]},
  { id: "urgences", icon: "phone", title: "Contacten en noodgevallen", items: [
    { q: "Noodgevallen", a: "112 (ambulance, brandweer) · 101 (politie) · Antigifcentrum: 070 245 245" },
    { q: "Gastheer", a: "Via de Airbnb-berichten (antwoord binnen het uur). In noodgevallen: het telefoonnummer hangt aan het bord bij de ingang." },
    { q: "Apotheek van wacht", a: "apotheek.be, of 0903 99 000" },
    { q: "Dokter en ziekenhuis", a: "Medisch centrum in Florenville (10 min). Ziekenhuis: Vivalia, Clinique Sud-Luxembourg in Aarlen (35 min) of CH de l'Ardenne in Libramont (40 min)." },
    { q: "Winkels", a: "Bakker en buurtwinkel in Jamoigne (5 min). Supermarkten in Florenville (10 min)." } ]}
]};

// EN-BEGIN — version anglaise (générée par tools/build_i18n_en.py, alignée par index sur le français)
window.MANUAL.en = {
 "sections": [
  {
   "id": "arrivee",
   "icon": "key",
   "title": "Arrival",
   "items": [
    {
     "q": "Check-in time",
     "a": "From 4 pm. Earlier arrival is often possible: just ask us the day before."
    },
    {
     "q": "Collecting the keys",
     "a": "Key box to the left of the front door, on the street side. The code is sent to you by Airbnb message on the day of arrival."
    },
    {
     "q": "Parking",
     "a": "Free parking in front of the house (2 cars), plus free parking on the street."
    },
    {
     "q": "Directions",
     "a": "From the N83, follow signs for Izel centre. The house is the ochre façade, a stone's throw from the church."
    }
   ]
  },
  {
   "id": "chauffage",
   "icon": "flame",
   "title": "Heating and wood stove",
   "items": [
    {
     "q": "Central heating",
     "a": "Thermostat in the living room, next to the kitchen door. Recommended setting: 20 °C by day, 17 °C at night. Each bedroom has its own thermostatic valve."
    },
    {
     "q": "Lighting the stove",
     "a": "1. Fully open the air slide under the door. 2. Two pieces of kindling crossed, a firelighter in the middle, two small logs on top. 3. Light it, leave the door ajar for 5 minutes, then close it. 4. Once the fire is going well, reduce the air supply by half."
    },
    {
     "q": "Firewood",
     "a": "A basket of dry wood is ready when you arrive. The stock is in the shelter at the far end of the terrace: please help yourself in moderation."
    },
    {
     "q": "Safety",
     "a": "Smoke and carbon monoxide alarms are fitted. Never leave the stove unattended with the door open, and only empty the ashes when cold, into the metal bucket."
    }
   ]
  },
  {
   "id": "cuisine",
   "icon": "chef",
   "title": "Kitchen and appliances",
   "items": [
    {
     "q": "Dishwasher",
     "a": "Tablets under the sink. “Eco 50°” programme recommended (3 h 30)."
    },
    {
     "q": "Washing machine",
     "a": "In the ground-floor shower room. Detergent provided for one load. Clothes airer in the cupboard under the stairs."
    },
    {
     "q": "Coffee maker",
     "a": "Filter coffee maker and kettle. A first packet of coffee and a few tea bags are waiting for you."
    },
    {
     "q": "Barbecue",
     "a": "Charcoal barbecue on the terrace. Charcoal and firelighters in the shelter. Let it cool before covering it."
    }
   ]
  },
  {
   "id": "multimedia",
   "icon": "music",
   "title": "Wifi and media",
   "items": [
    {
     "q": "Wifi",
     "a": "Scan the QR code above to connect automatically. Fibre broadband covers the whole house, attic included."
    },
    {
     "q": "JBL Bluetooth speaker",
     "a": "On the small bar in the living room. Switch it on, then select “JBL Charge” in your phone's Bluetooth settings."
    },
    {
     "q": "Workspace",
     "a": "Desk under the eaves, with a lamp and a socket nearby: ideal for working remotely in peace."
    }
   ]
  },
  {
   "id": "dechets",
   "icon": "recycle",
   "title": "Rubbish and recycling",
   "items": [
    {
     "q": "Bins",
     "a": "Chipped bins (grey: general waste, green: food waste) along the rear façade. Collection on Tuesday morning: put them out on Monday evening if your stay includes that day."
    },
    {
     "q": "Recycling",
     "a": "PMD (plastic, metal, drink cartons) in the blue bags (under the sink). Glass and paper/cardboard: in the crates in the shelter. We take them to the recycling centre."
    }
   ]
  },
  {
   "id": "regles",
   "icon": "house",
   "title": "House rules",
   "items": [
    {
     "q": "Pets",
     "a": "Pets are not allowed."
    },
    {
     "q": "Smoking",
     "a": "Non-smoking house. An ashtray is available on the terrace."
    },
    {
     "q": "Quiet",
     "a": "Izel is a peaceful village: please be considerate of the neighbours after 10 pm, especially in the garden."
    },
    {
     "q": "Baby",
     "a": "A cot is always available in the large bedroom. Please bring your own baby bedding."
    }
   ]
  },
  {
   "id": "depart",
   "icon": "door",
   "title": "Departure",
   "items": [
    {
     "q": "Check-out time",
     "a": "Before 11 am. A late check-out is sometimes possible: just ask us."
    },
    {
     "q": "Before you leave",
     "a": "Start the dishwasher, gather the used sheets at the foot of the beds, put the bins out, check the stove is out, close the windows and put the key back in the key box. Cleaning is included!"
    }
   ]
  },
  {
   "id": "urgences",
   "icon": "phone",
   "title": "Contacts and emergencies",
   "items": [
    {
     "q": "Emergencies",
     "a": "112 (ambulance, fire brigade) · 101 (police) · Poison Centre: 070 245 245"
    },
    {
     "q": "Host",
     "a": "Via Airbnb messaging (reply within an hour). In an emergency: the phone number is on the board by the entrance."
    },
    {
     "q": "Duty pharmacy",
     "a": "pharmacie.be, or 0903 99 000"
    },
    {
     "q": "Doctor and hospital",
     "a": "Medical centre in Florenville (10 min). Hospital: Vivalia, Clinique Sud-Luxembourg in Arlon (35 min) or CH de l'Ardenne in Libramont (40 min)."
    },
    {
     "q": "Shops",
     "a": "Bakery and convenience store in Jamoigne (5 min). Supermarkets in Florenville (10 min)."
    }
   ]
  }
 ]
};
// EN-END
