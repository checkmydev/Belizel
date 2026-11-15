// Fiche du bien (source : annonce Airbnb, relevée le 13/11/2026)
window.LISTING = {
  id: "844929788475952833",
  name: "Belizel",
  tagline: "Au cœur de la Gaume",
  airbnbUrl: "https://www.airbnb.be/rooms/844929788475952833",
  village: "Izel",
  commune: "Chiny",
  region: "Gaume · Province de Luxembourg · Belgique",
  lat: 49.6913, lng: 5.3794,
  guests: 6, bedrooms: 3, beds: 6, baths: 2,
  rating: 4.83, reviews: 48,
  cats: { cleanliness: 4.63, accuracy: 4.85, checkin: 4.98, communication: 4.96, location: 4.79, value: 4.85 },
  tags: { "Hospitalité": 28, "Espaces intérieurs": 16, "Espaces extérieurs": 15, "Emplacement": 15, "À proximité": 14, "Famille": 12, "Équipements": 10, "Cuisine": 9, "Qualité du sommeil": 9, "Randonnée": 5 },
  host: { since: 2022, responseRate: "100 %", responseTime: "moins d'une heure", superhost: false },
  price2027: { hiver_semaine: 207.5, printemps_we: 207.5 },
  intro: "Une maison gaumaise aux murs ocre, nichée dans le petit village d'Izel. Ici, on vit au rythme de la Semois : forêts à perte de vue, rivière qui serpente, abbaye d'Orval à quelques minutes et feu de bois le soir venu.",
  highlights: [
    { icon: "flame", title: "Poêle à bois", text: "Living chaleureux, parquet en chêne et pierres du pays apparentes." },
    { icon: "leaf", title: "Jardin & terrasse", text: "Transats, parasols, table de jardin et barbecue face au vert." },
    { icon: "bed", title: "3 grandes chambres", text: "Dont une chambre tout en bois sous les combles, lit king size." },
    { icon: "baby", title: "Familles bienvenues", text: "Lit bébé, livres et jouets d'enfants, jeux de société." },
    { icon: "laptop", title: "Télétravail possible", text: "Wifi et espace de travail dédié sous les toits." },
    { icon: "map", title: "Au cœur de la Gaume", text: "Orval, Chiny, Chassepierre et Florenville à moins de 10 km." }
  ],
  rooms: [
    { name: "Grande chambre sous les combles", beds: "1 lit king size · 1 lit simple · lit bébé", photo: "img/p08.jpg" },
    { name: "Chambre du 1er étage", beds: "1 lit queen size", photo: "img/p10.jpg" },
    { name: "Chambre verte", beds: "1 lit queen size · 1 lit simple", photo: "img/p09.jpg" },
    { name: "Living", beds: "1 canapé convertible", photo: "img/p04.jpg" }
  ],
  amenities: ["Wifi","Espace de travail","Poêle à bois","Chauffage central","Cuisine équipée","Lave-vaisselle","Lave-linge","Four","Micro-ondes","Congélateur","Cafetière","Bouilloire","Barbecue","Mobilier d'extérieur","Chaises longues","Vue sur le jardin","Baignoire","Lit bébé","Livres et jouets enfants","Jeux de société","Enceinte Bluetooth JBL","Climatiseur portable","Parking gratuit sur place","Stores occultants","Linge de lit","Oreillers et couvertures en plus","Trousse de secours","Détecteurs fumée & CO","Extincteur","Séjours longue durée"],
  amenitiesMissing: ["Télévision","Sèche-linge","Produits de base","Arrivée autonome","Animaux acceptés","Chaise haute"],
  gallery: [
    { src: "img/p01.jpg", cap: "La maison côté jardin", tag: "Extérieur" },
    { src: "img/p02.jpg", cap: "Le jardin au printemps", tag: "Extérieur" },
    { src: "img/p03.jpg", cap: "La terrasse en pierre", tag: "Extérieur" },
    { src: "img/p04.jpg", cap: "Le living et ses pierres du pays", tag: "Intérieur" },
    { src: "img/p06.jpg", cap: "La grande table en chêne", tag: "Intérieur" },
    { src: "img/p16.jpg", cap: "La cuisine équipée", tag: "Intérieur" },
    { src: "img/p08.jpg", cap: "La chambre sous les combles", tag: "Chambres" },
    { src: "img/p09.jpg", cap: "La chambre verte", tag: "Chambres" },
    { src: "img/p10.jpg", cap: "La chambre du 1er étage", tag: "Chambres" },
    { src: "img/p11.jpg", cap: "Lumière du matin", tag: "Chambres" },
    { src: "img/p12.jpg", cap: "L'espace de travail sous les toits", tag: "Intérieur" },
    { src: "img/p13.jpg", cap: "La salle de bain", tag: "Intérieur" },
    { src: "img/p14.jpg", cap: "La salle de douche", tag: "Intérieur" },
    { src: "img/p17.jpg", cap: "Façade arrière et terrasse", tag: "Extérieur" },
    { src: "img/p18.jpg", cap: "La façade ocre, côté rue", tag: "Extérieur" },
    { src: "img/p07.jpg", cap: "Noël à Belizel", tag: "Saisons" },
    { src: "img/p20.jpg", cap: "Les méandres de la Semois", tag: "Saisons" },
    { src: "img/p22.jpg", cap: "La Semois au printemps", tag: "Saisons" },
    { src: "img/p23.jpg", cap: "Couleurs d'automne", tag: "Saisons" },
    { src: "img/p24.jpg", cap: "Lumière d'hiver sur la rivière", tag: "Saisons" },
    { src: "img/p26.jpg", cap: "La vallée sous la neige", tag: "Saisons" }
  ]
};

// Version néerlandaise (alignée par index sur les listes françaises)
window.LISTING.nl = {
  tagline: "In het hart van de Gaume",
  intro: "Een Gaumais huis met okerkleurige muren, verscholen in het dorpje Izel. Hier leeft u op het ritme van de Semois: bossen zover het oog reikt, een kronkelende rivier, de abdij van Orval op enkele minuten en 's avonds een knapperend houtvuur.",
  highlights: [
    { title: "Houtkachel", text: "Gezellige leefruimte met eiken parket en zichtbare streekstenen." },
    { title: "Tuin & terras", text: "Ligstoelen, parasols, tuintafel en barbecue met zicht op het groen." },
    { title: "3 ruime slaapkamers", text: "Waaronder een volledig houten kamer onder het dak, met kingsize bed." },
    { title: "Gezinnen welkom", text: "Babybedje, kinderboeken en speelgoed, gezelschapsspellen." },
    { title: "Telewerken kan", text: "Wifi en een aparte werkplek onder het dak." },
    { title: "In het hart van de Gaume", text: "Orval, Chiny, Chassepierre en Florenville op minder dan 10 km." }
  ],
  rooms: [
    { name: "Grote kamer onder het dak", beds: "1 kingsize bed · 1 eenpersoonsbed · babybedje" },
    { name: "Kamer op de eerste verdieping", beds: "1 queensize bed" },
    { name: "Groene kamer", beds: "1 queensize bed · 1 eenpersoonsbed" },
    { name: "Leefruimte", beds: "1 slaapbank" }
  ],
  amenities: ["Wifi","Werkplek","Houtkachel","Centrale verwarming","Uitgeruste keuken","Vaatwasser","Wasmachine","Oven","Microgolfoven","Diepvriezer","Koffiezetapparaat","Waterkoker","Barbecue","Tuinmeubilair","Ligstoelen","Zicht op de tuin","Bad","Babybedje","Kinderboeken en speelgoed","Gezelschapsspellen","Bluetooth-luidspreker JBL","Mobiele airco","Gratis parking ter plaatse","Verduisterende gordijnen","Bedlinnen","Extra kussens en dekens","EHBO-kit","Rook- en CO-melders","Brandblusser","Lange verblijven"],
  gallery: ["Het huis aan de tuinkant","De tuin in de lente","Het stenen terras","De leefruimte met streekstenen","De grote eiken tafel","De uitgeruste keuken","De kamer onder het dak","De groene kamer","De kamer op de eerste verdieping","Ochtendlicht","De werkplek onder het dak","De badkamer","De douchekamer","Achtergevel en terras","De okerkleurige gevel, straatkant","Kerstmis in Belizel","De meanders van de Semois","De Semois in de lente","Herfstkleuren","Winterlicht op de rivier","De vallei onder de sneeuw"]
};

// EN-BEGIN — version anglaise (générée par tools/build_i18n_en.py, alignée par index sur le français)
window.LISTING.en = {
 "tagline": "In the heart of Gaume",
 "intro": "A Gaume house with ochre walls, tucked away in the little village of Izel. Here, life follows the rhythm of the Semois: forests as far as the eye can see, a winding river, Orval Abbey a few minutes away and a wood fire once evening falls.",
 "highlights": [
  {
   "title": "Wood stove",
   "text": "Cosy living room with oak parquet and exposed local stone."
  },
  {
   "title": "Garden & terrace",
   "text": "Sun loungers, parasols, garden table and barbecue overlooking the greenery."
  },
  {
   "title": "3 large bedrooms",
   "text": "Including an all-wood attic bedroom with a king-size bed."
  },
  {
   "title": "Families welcome",
   "text": "Cot, children's books and toys, board games."
  },
  {
   "title": "Remote working possible",
   "text": "Wifi and a dedicated workspace under the eaves."
  },
  {
   "title": "In the heart of Gaume",
   "text": "Orval, Chiny, Chassepierre and Florenville less than 10 km away."
  }
 ],
 "rooms": [
  {
   "name": "Large attic bedroom",
   "beds": "1 king-size bed · 1 single bed · cot"
  },
  {
   "name": "First-floor bedroom",
   "beds": "1 queen-size bed"
  },
  {
   "name": "Green bedroom",
   "beds": "1 queen-size bed · 1 single bed"
  },
  {
   "name": "Living room",
   "beds": "1 sofa bed"
  }
 ],
 "amenities": [
  "Wifi",
  "Workspace",
  "Wood stove",
  "Central heating",
  "Equipped kitchen",
  "Dishwasher",
  "Washing machine",
  "Oven",
  "Microwave",
  "Freezer",
  "Coffee maker",
  "Kettle",
  "Barbecue",
  "Outdoor furniture",
  "Sun loungers",
  "Garden view",
  "Bath",
  "Cot",
  "Children's books and toys",
  "Board games",
  "JBL Bluetooth speaker",
  "Portable air conditioner",
  "Free parking on site",
  "Blackout blinds",
  "Bed linen",
  "Extra pillows and blankets",
  "First aid kit",
  "Smoke & CO alarms",
  "Fire extinguisher",
  "Long stays"
 ],
 "gallery": [
  "The house from the garden",
  "The garden in spring",
  "The stone terrace",
  "The living room and its local stone",
  "The large oak table",
  "The equipped kitchen",
  "The attic bedroom",
  "The green bedroom",
  "The first-floor bedroom",
  "Morning light",
  "The workspace under the eaves",
  "The bathroom",
  "The shower room",
  "Rear façade and terrace",
  "The ochre façade, street side",
  "Christmas at Belizel",
  "The meanders of the Semois",
  "The Semois in spring",
  "Autumn colours",
  "Winter light on the river",
  "The valley under snow"
 ]
};
// EN-END
