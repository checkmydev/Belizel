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
