/* Belizel — bilinguisme FR / NL du guide voyageurs.
   Langue : ?lang=fr|nl, sinon choix mémorisé, sinon langue du navigateur.
   L'interface est traduite à la volée (dictionnaire FR→NL appliqué aux textes du DOM, y compris rendus dynamiquement) ;
   les contenus (événements, histoire, terroir…) ont leur propre version néerlandaise (data/content.nl.js). */
(function(){
const q = new URLSearchParams(location.search).get('lang');
let saved = null; try{ saved = localStorage.getItem('belizel.lang'); }catch(e){}
const LANG = (q === 'nl' || q === 'fr') ? q : (saved || ((navigator.language||'').toLowerCase().startsWith('nl') ? 'nl' : 'fr'));
try{ if(q) localStorage.setItem('belizel.lang', q); }catch(e){}
window.LANG = LANG; window.LOCALE = LANG === 'nl' ? 'nl-BE' : 'fr-BE';
document.documentElement.lang = LANG;

const NL = {
// navigation & en-têtes
"Belizel · Gîte au cœur de la Gaume":"Belizel · Vakantiewoning in het hart van de Gaume",
"La maison":"Het huis","Carte":"Kaart","Balades":"Wandelingen","Activités":"Activiteiten","Agenda":"Agenda","Terroir":"Streekproducten","Histoire":"Geschiedenis","Mode d'emploi":"Huisgids",
"Installer l'application":"De app installeren","Installer l'appli":"App installeren","Mon séjour":"Mijn verblijf","Visite guidée":"Rondleiding","Maison":"Huis","Plus":"Meer",
"Bienvenue à Izel":"Welkom in Izel",
"Une maison gaumaise aux murs ocre, entre forêts profondes, méandres de la Semois et abbaye d'Orval. Le feu de bois en plus.":"Een Gaumais huis met okerkleurige muren, tussen diepe bossen, de meanders van de Semois en de abdij van Orval. Met een houtvuur erbij.",
"Réserver sur Airbnb":"Boeken op Airbnb","Explorer la région":"Ontdek de streek","Maintenant à Izel":"Nu in Izel","Chargement de la météo…":"Weerbericht laden…",
"Une vraie maison de village":"Een echt dorpshuis","En images":"In beeld","Au fil des saisons":"Doorheen de seizoenen",
"Cliquez sur une photo pour l'agrandir ; les flèches du clavier permettent de naviguer.":"Klik op een foto om ze te vergroten; met de pijltjestoetsen bladert u verder.",
"Pour bien dormir":"Goed slapen","3 chambres, 6 couchages":"3 slaapkamers, 6 slaapplaatsen",
"Chauffage central dans toutes les chambres, stores occultants, linge de lit fourni et lit bébé toujours disponible.":"Centrale verwarming in alle kamers, verduisterende gordijnen, bedlinnen inbegrepen en altijd een babybedje beschikbaar.",
"Tout ce qu'il faut sur place":"Alles wat u nodig hebt ter plaatse","Ils sont venus":"Zij waren er al","Ce que disent les voyageurs":"Wat gasten zeggen",
"Les mots qui reviennent":"Woorden die vaak terugkomen","Thèmes repérés dans les commentaires, avec leur nombre de mentions.":"Thema's uit de beoordelingen, met het aantal vermeldingen.",
"Autour de la maison":"Rond het huis","La carte de vos escapades":"De kaart van uw uitstappen",
"Balades, activités, tables, producteurs, patrimoine et événements : tout est sur la carte, avec la maison au centre.":"Wandelingen, activiteiten, restaurants, producenten, erfgoed en evenementen: alles staat op de kaart, met het huis in het midden.",
"À pied ou à vélo":"Te voet of met de fiets","Balades balisées autour d'Izel":"Bewegwijzerde wandelingen rond Izel",
"Tracés officiels balisés, avec profil d'altitude, et fichier GPX à télécharger pour votre téléphone, votre montre ou votre GPS.":"Officiële bewegwijzerde routes, met hoogteprofiel en GPX-bestand om te downloaden naar uw smartphone, horloge of gps.",
"Toutes difficultés":"Alle moeilijkheden","Toutes distances":"Alle afstanden","Moins de 6 km":"Minder dan 6 km","6 à 12 km":"6 tot 12 km","Plus de 12 km":"Meer dan 12 km",
"Les plus proches":"Dichtstbij","Les plus courtes":"Kortste","Les plus longues":"Langste","Les moins pentues":"Minst steil","Voir plus de balades":"Meer wandelingen tonen",
"Facile":"Makkelijk","Moyen":"Gemiddeld","Sportif":"Sportief","facile":"makkelijk","moyen":"gemiddeld","sportif":"sportief",
"Vos balades dans la poche":"Uw wandelingen op zak","Guidé pas à pas, même sans réseau":"Stap voor stap begeleid, zelfs zonder bereik",
"En forêt d'Anlier ou dans la vallée de la Semois, le réseau mobile est capricieux. Nous conseillons":"In het woud van Anlier of in de Semoisvallei is het gsm-bereik grillig. Wij raden",
": gratuite, sans publicité ni compte, elle fonctionne entièrement hors ligne et affiche votre position sur le tracé.":"aan: gratis, zonder reclame of account, volledig offline en met uw positie op de route.",
"Installez l'application":"Installeer de app","(gratuite) :":"(gratis):",
"Téléchargez la carte « Belgique, Luxembourg »":"Download de kaart « België, Luxemburg »",
"dans l'application, de préférence en wifi à la maison (environ 60 Mo).":"in de app, liefst via de wifi in het huis (ongeveer 60 MB).",
"Importez les balades":"Importeer de wandelingen",
": touchez un pack ci-dessous, puis « Ouvrir avec Organic Maps ». Toutes les balades apparaissent dans vos listes, prêtes à suivre.":": tik hieronder op een pakket en kies « Openen met Organic Maps ». Alle wandelingen verschijnen in uw lijsten, klaar om te volgen.",
"Les 15 balades les plus proches":"De 15 dichtstbijzijnde wandelingen","Au départ d'Izel ou à moins de 10 min":"Vertrek in Izel of op minder dan 10 min",
"Toutes les balades à pied":"Alle wandelingen","Mes balades favorites":"Mijn favoriete wandelingen","Celles que vous avez marquées":"Die u hebt aangeduid",
"Itinéraires vélo":"Fietsroutes","RAVeL et voies vertes":"RAVeL en groene wegen",
"Format GPX, compatible aussi avec OsmAnd, Komoot, Visorando, Garmin et Suunto.":"GPX-formaat, ook geschikt voor OsmAnd, Komoot, Visorando, Garmin en Suunto.",
"Que faire ?":"Wat te doen?","Activités du coin":"Activiteiten in de buurt",
"Kayak sur la Semois, abbaye d'Orval, châteaux, villages classés, sorties en famille… avec le temps de route depuis la maison.":"Kajakken op de Semois, abdij van Orval, kastelen, beschermde dorpen, uitstappen met het gezin… met de rijtijd vanaf het huis.",
"Spécial jour de pluie":"Speciaal voor regendagen","Tout":"Alles",
"Ça se passe en Gaume":"Het gebeurt in de Gaume","Agenda des événements":"Evenementenagenda",
"Festivals, marchés, fêtes de village… Indiquez vos dates pour voir ce qui se passe pendant votre séjour.":"Festivals, markten, dorpsfeesten… Geef uw data in en zie wat er tijdens uw verblijf te beleven valt.",
"Mon séjour :":"Mijn verblijf:","Voir mes événements":"Mijn evenementen tonen","Tout l'agenda":"Volledige agenda",
"À table !":"Aan tafel!","Saveurs de Gaume":"Smaken van de Gaume",
"Orval, pâté gaumais, Plate de Florenville, saucisson IGP… Les spécialités à goûter, nos tables préférées, les producteurs et quelques recettes à cuisiner dans la maison.":"Orval, Gaumse paté, Plate de Florenville, BGA-worst… De specialiteiten om te proeven, onze favoriete restaurants, de producenten en enkele recepten om zelf in het huis te koken.",
"Spécialités":"Specialiteiten","Nos tables":"Onze restaurants","Producteurs":"Producenten","Recettes":"Recepten",
"Mémoire du village":"Geheugen van het dorp","Izel, une histoire de Gaume":"Izel, een verhaal uit de Gaume",
"De la chaussée romaine aux incendies d'août 1914, de l'occupation à la Libération : ce que racontent les pierres du village, et ce que vous pouvez encore voir aujourd'hui.":"Van de Romeinse heirbaan tot de branden van augustus 1914, van de bezetting tot de Bevrijding: wat de stenen van het dorp vertellen, en wat u vandaag nog kunt zien.",
"Frise du temps":"Tijdlijn","À voir au village":"Te zien in het dorp","Légendes":"Legenden","Histoires de la maison":"Verhalen van het huis","Histoire de la maison":"Verhaal van het huis",
"Afficher :":"Tonen:","Les guerres":"De oorlogen","Il était une fois…":"Er was eens…","Les souvenirs de ceux qui ont fait revivre Belizel.":"Herinneringen van wie Belizel nieuw leven inblies.",
"L'âme gaumaise":"De ziel van de Gaume","Culture et traditions":"Cultuur en tradities",
"Une langue à part, des légendes, des festivals de renom et des villages aux façades colorées : bienvenue dans la « petite Provence belge ».":"Een eigen taal, legenden, befaamde festivals en dorpen met kleurrijke gevels: welkom in de « kleine Belgische Provence ».",
"Votre carnet":"Uw reisdagboek","Mon séjour, jour par jour":"Mijn verblijf, dag per dag",
"Ajoutez des balades, activités et restaurants à vos favoris (♥), puis glissez-les dans vos journées. Votre programme reste enregistré sur cet appareil.":"Voeg wandelingen, activiteiten en restaurants toe aan uw favorieten (♥) en sleep ze naar uw dagen. Uw programma blijft bewaard op dit toestel.",
"Mes favoris":"Mijn favorieten","Agenda (.ics)":"Agenda (.ics)","Imprimer":"Afdrukken","Partager":"Delen","Durée :":"Duur:",
"Comme à la maison":"Thuis als nergens anders","Mode d'emploi de la maison":"Huisgids",
"Tout ce qu'il faut savoir pour profiter de Belizel : arrivée, poêle à bois, wifi, tri, départ et numéros utiles.":"Alles wat u moet weten om van Belizel te genieten: aankomst, houtkachel, wifi, afval sorteren, vertrek en nuttige nummers.",
"Rechercher (poêle, poubelles, clés…)":"Zoeken (kachel, vuilnis, sleutels…)",
"Maison de vacances à Izel (Chiny), au cœur de la Gaume et de la vallée de la Semois.":"Vakantiewoning in Izel (Chiny), in het hart van de Gaume en de Semoisvallei.",
"Sources":"Bronnen","Raccourcis":"Snelkoppelingen",
"Tracés : © contributeurs OpenStreetMap (ODbL), balisage des syndicats d'initiative. Altitudes et météo : Open-Meteo. Fonds de carte : OpenStreetMap / OpenTopoMap. Informations touristiques vérifiées en novembre 2026 : confirmez les horaires auprès des sites officiels.":"Routes: © OpenStreetMap-bijdragers (ODbL), bewegwijzering van de toeristische diensten. Hoogtes en weer: Open-Meteo. Kaarten: OpenStreetMap / OpenTopoMap. Toeristische informatie gecontroleerd in november 2026: controleer de openingsuren op de officiële sites.",
"Revoir la visite guidée":"Rondleiding opnieuw bekijken","Guide d'utilisation":"Gebruiksaanwijzing","Espace propriétaire":"Eigenaarsruimte",
"Bienvenue !":"Welkom!","Ce guide vous accompagne avant et pendant votre séjour à Belizel. En deux mots :":"Deze gids begeleidt u voor en tijdens uw verblijf in Belizel. Kort samengevat:",
"Explorez":"Ontdek","la carte, les balades balisées (GPX à télécharger), les activités et l'agenda.":"de kaart, de bewegwijzerde wandelingen (GPX om te downloaden), de activiteiten en de agenda.",
"Ajoutez en favori ♥":"Markeer als favoriet ♥","ce qui vous tente, puis organisez vos journées dans « Mon séjour ».":"wat u aanspreekt, en plan uw dagen in « Mijn verblijf ».",
"Sur place":"Ter plaatse",", le mode d'emploi de la maison répond à toutes vos questions : wifi, poêle, tri, départ…":", beantwoordt de huisgids al uw vragen: wifi, kachel, afval, vertrek…",
"Visite guidée (1 min)":"Rondleiding (1 min)","Je découvre seul":"Ik ontdek zelf","Plus de rubriques":"Meer rubrieken","Photos":"Foto's","Culture":"Cultuur",
// météo
"Ensoleillé":"Zonnig","Éclaircies":"Opklaringen","Couvert":"Bewolkt","Brouillard":"Mist","Bruine":"Motregen","Pluie":"Regen","Neige":"Sneeuw","Averses":"Buien","Averses de neige":"Sneeuwbuien","Orage":"Onweer",
"Auj.":"Vand.","Météo indisponible hors connexion.":"Weerbericht niet beschikbaar zonder verbinding.",
"Idéal pour marcher":"Ideaal om te wandelen","Voir la balade →":"Bekijk de wandeling →","Voir les activités →":"Bekijk de activiteiten →",
"Journée humide : une idée à l'abri":"Natte dag: een idee onder dak","Il fait chaud : direction la Semois":"Het is warm: op naar de Semois",
// maison
"Propreté":"Netheid","Exactitude":"Nauwkeurigheid","Arrivée":"Aankomst","Communication":"Communicatie","Emplacement":"Locatie","Qualité-prix":"Prijs-kwaliteit",
"Intérieur":"Binnen","Extérieur":"Buiten","Chambres":"Slaapkamers","Saisons":"Seizoenen",
"Hospitalité":"Gastvrijheid","Espaces intérieurs":"Binnenruimtes","Espaces extérieurs":"Buitenruimtes","À proximité":"In de buurt","Famille":"Gezin","Équipements":"Voorzieningen","Cuisine":"Keuken","Qualité du sommeil":"Slaapkwaliteit","Randonnée":"Wandelen",
// carte
"Restaurants":"Restaurants","Événements":"Evenementen","Itinéraire":"Route","Favori":"Favoriet","Retirer":"Verwijderen","Votre maison à Izel":"Uw huis in Izel",
"Balade":"Wandeling","Activité":"Activiteit","Restaurant":"Restaurant","Producteur":"Producent","Événement":"Evenement","Patrimoine":"Erfgoed",
"Relief":"Reliëf","Plan":"Plattegrond","Satellite":"Satelliet","Départ":"Vertrek",
// balades
"À pied":"Te voet","À vélo":"Met de fiets","Itinéraire balisé":"Bewegwijzerde route","à pied depuis la maison":"te voet vanaf het huis",
"Aucune balade ne correspond. Ajoutez des favoris avec ♥ ou élargissez les filtres.":"Geen wandeling gevonden. Voeg favorieten toe met ♥ of verruim de filters.",
"Distance":"Afstand","Durée":"Duur","Dénivelé":"Hoogteverschil","Parcours":"Parcours","Boucle":"Lus","Aller":"Enkele reis",
"Survolez le profil pour suivre votre position sur la carte.":"Beweeg over het profiel om uw positie op de kaart te volgen.",
"Télécharger le GPX":"GPX downloaden","Aller au départ":"Naar het vertrekpunt","OpenStreetMap":"OpenStreetMap","En chemin":"Onderweg",
"Départ à pied depuis la maison":"Vertrek te voet vanaf het huis","Itinéraire vélo balisé.":"Bewegwijzerde fietsroute.","peint sur les arbres et les poteaux.":"op de bomen en palen geschilderd.",
"Tracé © contributeurs OpenStreetMap (ODbL). Durée estimée à 4,2 km/h, plus 1 h par 450 m de montée. Altitudes EU-DEM 25 m. Prévoyez de bonnes chaussures : les sentiers gaumais sont souvent humides.":"Route © OpenStreetMap-bijdragers (ODbL). Duur geschat aan 4,2 km/u, plus 1 u per 450 m stijging. Hoogtes EU-DEM 25 m. Neem goede schoenen mee: de paden in de Gaume zijn vaak vochtig.",
"GPX téléchargé : ouvrez-le dans votre app de randonnée":"GPX gedownload: open het in uw wandelapp","Ajoutez d'abord des balades en favori ♥":"Voeg eerst wandelingen toe aan uw favorieten ♥","Aucun itinéraire":"Geen route",
// activités
"Nature":"Natuur","Panoramas":"Panorama's","Eau & kayak":"Water & kajak","En famille":"Met het gezin","Gourmand":"Lekkerbek",
"☔ par temps de pluie":"☔ bij regenweer","Site ↗":"Website ↗","Site officiel ↗":"Officiële website ↗","Source ↗":"Bron ↗","En savoir plus ↗":"Meer weten ↗",
"Voir sur la carte":"Op de kaart bekijken","À pied depuis la maison":"Te voet vanaf het huis",
// agenda
"Chaque semaine":"Elke week","marchés":"markten","chaque":"elke","date à confirmer":"datum te bevestigen","+ Mon agenda":"+ Mijn agenda",
"Pas d'événement répertorié sur cette période : profitez du calme et des balades !":"Geen evenementen in deze periode: geniet van de rust en de wandelingen!",
"Indiquez vos dates d'arrivée et de départ":"Geef uw aankomst- en vertrekdatum in","Agenda filtré sur votre séjour":"Agenda gefilterd op uw verblijf",
"festival":"festival","marché":"markt","sport":"sport","culture":"cultuur","gastronomie":"gastronomie","nature":"natuur","enfants":"kinderen",
// terroir
"Réservez, surtout le week-end et en été. Horaires à vérifier : beaucoup de tables ferment en début de semaine.":"Reserveer, zeker in het weekend en in de zomer. Controleer de openingsuren: veel restaurants zijn begin van de week gesloten.",
"Mode cuisine":"Kookmodus","Liste de courses":"Boodschappenlijst","Précédent":"Vorige","Suivant":"Volgende","Bon appétit ! 🍽️":"Smakelijk! 🍽️","Mode cuisine · l'écran reste allumé":"Kookmodus · het scherm blijft aan",
// culture
"langue":"taal","traditions":"tradities","art":"kunst","musée":"museum","littérature":"literatuur","musique":"muziek","légende":"legende",
// séjour
"Jour…":"Dag…","Glissez une activité ici":"Sleep hier een activiteit","Journée libre":"Vrije dag","Tout est planifié 👌":"Alles is gepland 👌",
"Ajoutez des favoris ♥ depuis les balades, activités, restaurants ou l'agenda.":"Voeg favorieten ♥ toe vanuit de wandelingen, activiteiten, restaurants of de agenda.",
"Indiquez vos dates dans l'agenda pour les caler sur votre séjour.":"Geef uw data in de agenda in om ze af te stemmen op uw verblijf.",
"Planifiez d'abord quelques activités":"Plan eerst enkele activiteiten","Lien copié : envoyez-le à vos compagnons de voyage":"Link gekopieerd: stuur hem naar uw reisgenoten",
"Programme partagé importé ✨":"Gedeeld programma geïmporteerd ✨","Ajouté à « Mon séjour » ♥":"Toegevoegd aan « Mijn verblijf » ♥","Mon séjour à Belizel":"Mijn verblijf in Belizel","Notre séjour à Belizel":"Ons verblijf in Belizel",
"Choisir un jour":"Kies een dag","Retirer de ce jour":"Verwijderen van deze dag","Ajouter à mon séjour":"Toevoegen aan mijn verblijf",
// mode d'emploi
"Réservé à nos hôtes":"Voorbehouden aan onze gasten","Entrez le code reçu dans votre message de confirmation Airbnb.":"Geef de code in die u ontving in uw Airbnb-bevestigingsbericht.",
"Ouvrir":"Openen","Le wifi s'affiche ici une fois le code saisi.":"De wifi verschijnt hier zodra de code is ingegeven.","Code incorrect":"Ongeldige code",
"Aucun résultat. Contactez-nous via Airbnb !":"Geen resultaat. Neem contact op via Airbnb!","Mot de passe :":"Wachtwoord:","Copier le mot de passe":"Wachtwoord kopiëren","Mot de passe copié":"Wachtwoord gekopieerd","Wifi":"Wifi",
// visite guidée
"Bienvenue à Belizel 👋":"Welkom in Belizel 👋",
"Cette visite express vous montre comment tirer le meilleur de ce guide. Vous pouvez la quitter à tout moment (Échap).":"Deze snelle rondleiding toont hoe u het meeste uit deze gids haalt. U kunt ze altijd verlaten (Esc).",
"La météo et l'idée du jour":"Het weer en het idee van de dag","Météo en direct à Izel et une suggestion adaptée au temps : balade s'il fait beau, visite à l'abri s'il pleut.":"Live weer in Izel en een suggestie volgens het weer: wandelen bij mooi weer, een bezoek onder dak als het regent.",
"La carte interactive":"De interactieve kaart","Activez les calques (balades, activités, restaurants, histoire, événements) et cliquez sur un tracé pour ouvrir sa fiche.":"Schakel de lagen in (wandelingen, activiteiten, restaurants, geschiedenis, evenementen) en klik op een route om de fiche te openen.",
"Les balades balisées":"De bewegwijzerde wandelingen","Chaque fiche montre le tracé, le dénivelé et le profil d'altitude. Téléchargez le GPX pour vous guider sur votre téléphone.":"Elke fiche toont de route, het hoogteverschil en het hoogteprofiel. Download de GPX om u te laten gidsen op uw smartphone.",
"Activités, même sous la pluie":"Activiteiten, zelfs in de regen","Filtrez par envie et activez « Spécial jour de pluie » pour ne garder que les activités à l'abri.":"Filter op zin en schakel « Speciaal voor regendagen » in om enkel overdekte activiteiten te tonen.",
"Votre séjour dans l'agenda":"Uw verblijf in de agenda","Entrez vos dates : l'agenda ne garde que les événements pendant votre séjour, et vous pouvez les ajouter à votre calendrier.":"Geef uw data in: de agenda toont enkel de evenementen tijdens uw verblijf, en u kunt ze aan uw kalender toevoegen.",
"Le terroir":"De streekproducten","Spécialités, bonnes tables et producteurs, avec des recettes gaumaises à cuisiner pas à pas en mode cuisine.":"Specialiteiten, goede restaurants en producenten, met Gaumse recepten om stap voor stap te koken in de kookmodus.",
"Tous vos ♥ arrivent ici. Glissez-les dans vos journées, puis exportez vers votre agenda, imprimez ou partagez le programme.":"Al uw ♥ komen hier terecht. Sleep ze naar uw dagen en exporteer naar uw agenda, druk af of deel het programma.",
"Scannez le QR code pour le wifi. Le mode d'emploi répond à toutes les questions sur la maison.":"Scan de QR-code voor de wifi. De huisgids beantwoordt alle vragen over het huis.",
"Besoin d'aide ?":"Hulp nodig?","Ce bouton relance la visite à tout moment. Bon séjour en Gaume ! 🌿":"Met deze knop start u de rondleiding opnieuw. Fijn verblijf in de Gaume! 🌿",
"Passer":"Overslaan","Retour":"Terug","Terminer":"Afsluiten",
// guide d'utilisation
"La carte":"De kaart","Les fichiers GPX":"De GPX-bestanden","Favoris et Mon séjour":"Favorieten en Mijn verblijf","Hors connexion":"Offline",
"Les boutons en haut de la carte affichent ou masquent chaque catégorie. En bas à droite, choisissez le fond : relief, plan ou satellite. Cliquez sur un tracé de balade pour ouvrir sa fiche.":"Met de knoppen bovenaan de kaart toont of verbergt u elke categorie. Rechtsonder kiest u de achtergrond: reliëf, plattegrond of satelliet. Klik op een wandelroute om de fiche te openen.",
"Le bouton « Télécharger le GPX » enregistre le tracé. Sur téléphone, ouvrez-le avec une application de randonnée (Komoot, Visorando, OsmAnd, Organic Maps…) ou importez-le dans votre montre GPS (Garmin Connect, Suunto…). Le suivi fonctionne sans réseau une fois la carte téléchargée dans l'application.":"Met de knop « GPX downloaden » bewaart u de route. Open ze op uw smartphone met een wandelapp (Komoot, Visorando, OsmAnd, Organic Maps…) of importeer ze in uw gps-horloge (Garmin Connect, Suunto…). Eens de kaart in de app gedownload is, werkt alles zonder bereik.",
"Le cœur ♥ ajoute un élément à « Mon séjour ». Sur ordinateur, glissez-déposez les éléments dans les journées ; sur téléphone, utilisez le menu « Jour… ». Tout est enregistré sur votre appareil, sans compte. « Partager » génère un lien qui transmet votre programme.":"Het hartje ♥ voegt een element toe aan « Mijn verblijf ». Op de computer sleept u de elementen naar de dagen; op de smartphone gebruikt u het menu « Dag… ». Alles wordt op uw toestel bewaard, zonder account. « Delen » maakt een link die uw programma doorstuurt.",
"Renseignez vos dates : la pastille orange signale les mois de votre séjour. « + Mon agenda » ajoute un événement à votre calendrier (.ics).":"Geef uw data in: het oranje bolletje duidt de maanden van uw verblijf aan. « + Mijn agenda » voegt een evenement toe aan uw kalender (.ics).",
"Les recettes s'affichent étape par étape en grand, et l'écran reste allumé pendant que vous cuisinez.":"De recepten verschijnen stap voor stap in groot formaat, en het scherm blijft aan terwijl u kookt.",
"La météo et les fonds de carte demandent une connexion. Le reste du guide s'affiche normalement.":"Het weer en de kaarten vereisen een verbinding. De rest van de gids werkt gewoon.",
// application installable
"Touchez le bouton":"Tik op de knop","en bas de Safari.":"onderaan in Safari.","Choisissez":"Kies","« Sur l'écran d'accueil »":"« Zet op beginscherm »","Touchez":"Tik op","Ajouter":"Voeg toe",
": l'icône apparaît avec vos applications.":": het icoon verschijnt bij uw apps.","Compris":"Begrepen","Installer":"Installeren",
"Accès en un geste depuis votre écran d'accueil, même hors ligne.":"Met één tik bereikbaar vanaf uw beginscherm, zelfs offline.","Application installée ✓":"App geïnstalleerd ✓",
"Tous paysages":"Alle landschappen","Surtout en forêt":"Vooral door het bos","Au bord de l'eau":"Langs het water","Par les villages":"Door de dorpen","Sans village, au calme":"Zonder dorpen, rustig","Sur sentiers":"Over smalle paadjes","Part en forêt":"Aandeel bos","Types de chemins":"Soorten wegen","Sentiers":"Paadjes","Chemins":"Bos- en veldwegen","Routes":"Wegen","Suivez-la sur votre téléphone":"Volg ze op uw smartphone","Gratuit et hors ligne : installez Organic Maps, puis ouvrez le GPX avec l'application.":"Gratis en offline: installeer Organic Maps en open de GPX met de app.","Installer Belizel":"Belizel installeren","Poêle à bois":"Houtkachel","Jardin":"Tuin"
};
// Fragments avec nombres ou noms (appliqués dans les textes du DOM en néerlandais)
const RULES = [
  [/(\d+) voyageurs/g,'$1 reizigers'],[/(\d+) chambres/g,'$1 slaapkamers'],[/(\d+) salles de bain/g,'$1 badkamers'],[/(\d+) avis vérifiés sur Airbnb/g,'$1 geverifieerde beoordelingen op Airbnb'],
  [/ · (\d+) avis/g,' · $1 beoordelingen'],[/(\d+) itinéraires?\b/g,'$1 routes'],[/ min en voiture/g,' min met de auto'],[/départ à /g,'vertrek op '],[/vent (\d+) km\/h/g,'wind $1 km/u'],
  [/° à Izel/g,'° in Izel'],[/(\d+) évén\./g,'$1 evenem.'],[/^Étape (\d+) \/ (\d+)$/,'Stap $1 / $2'],[/^Jour (\d+)$/,'Dag $1'],[/^(\d+) jours?$/,'$1 dag(en)'],[/^Ingrédients \((\d+)\)$/,'Ingrediënten ($1)'],
  [/^Où \? /,'Waar? '],[/Balisage /g,'Bewegwijzering '],[/^du (.+) au (.+)$/,'van $1 tot $2'],[/Le tracé passe à (.+) de la maison, soit environ (\d+) min en voiture\./,'De route ligt op $1 van het huis, ongeveer $2 min met de auto.'],
  [/^: le tracé passe à (.+) de Belizel\./,': de route komt op $1 van Belizel.'],[/ Suivez le balisage /,' Volg de bewegwijzering '],[/ · départ à /g,' · vertrek op '],
  [/(\d+) balades? prêtes? : ouvrez le fichier avec Organic Maps/,'$1 wandeling(en) klaar: open het bestand met Organic Maps'],[/^Installer (.+)$/,'$1 installeren'],
  [/(\d+) km de montée/g,'$1 km stijging'],[/ à l'abri/g,' onder dak']
];
const T = window.T = s => LANG === 'nl' && NL[s] != null ? NL[s] : s;
window.MONTHS_UI = LANG === 'nl' ? ['jan.','feb.','maart','apr.','mei','juni','juli','aug.','sep.','okt.','nov.','dec.'] : ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];

function tr(text){
  const t = text.trim(); if(!t) return text;
  if(NL[t] != null) return text.replace(t, NL[t]);
  let out = text; for(const [re, rep] of RULES) out = out.replace(re, rep); return out;
}
const SKIP = new Set(['SCRIPT','STYLE','TEXTAREA','CODE']);
function walk(root){
  if(LANG !== 'nl') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: n => (n.parentElement && !SKIP.has(n.parentElement.tagName) && !n.parentElement.closest('[data-noi18n]')) ? 1 : 2});
  const nodes = []; while(w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => { const v = tr(n.nodeValue); if(v !== n.nodeValue) n.nodeValue = v; });
  (root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[aria-label]') : []).forEach(el => ['placeholder','title','aria-label'].forEach(a => { const v = el.getAttribute(a); if(v && NL[v]) el.setAttribute(a, NL[v]); }));
}
window.i18nApply = walk;
if(LANG === 'nl'){
  const go = () => { document.title = T(document.title); walk(document.body);
    new MutationObserver(ms => ms.forEach(m => { m.addedNodes.forEach(n => { if(n.nodeType === 3){ const v = tr(n.nodeValue); if(v !== n.nodeValue) n.nodeValue = v; } else if(n.nodeType === 1) walk(n); }); if(m.type === 'characterData'){ const v = tr(m.target.nodeValue); if(v !== m.target.nodeValue) m.target.nodeValue = v; } }))
      .observe(document.body, {childList:true, subtree:true, characterData:true}); };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
}
// Sélecteur de langue
window.setLang = l => { try{ localStorage.setItem('belizel.lang', l); }catch(e){} const u = new URL(location.href); u.searchParams.set('lang', l); location.href = u.toString(); };
})();
