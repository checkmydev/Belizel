"""Génère des données financières D'EXEMPLE (fictives) pour visualiser l'espace admin.
À remplacer par les vraies données : import du CSV Airbnb + saisie des dépenses dans l'admin."""
import json, random, datetime as dt, os
random.seed(42)
D = dt.date
book, exp = [], []
start, today, horizon = D(2023, 4, 1), D(2026, 11, 13), D(2027, 3, 31)
occ = {1:.32,2:.38,3:.36,4:.5,5:.55,6:.58,7:.85,8:.9,9:.55,10:.6,11:.4,12:.55}
names = ['Famille Peeters','Sophie & Marc','Famille Dubois','Jan V.','Groupe d\'amis de Gand','Famille Lambert','Anke & Tom','Claire M.','Famille Janssens','Pieter D.','Famille Leroy','Nathalie & amis','Famille Maes','Julien R.','Famille Wouters','Elise & Hugo','Famille Martin','Koen & Lies','Famille Simon','Groupe de randonneurs']
d = start; n = 0
while d < horizon:
    m = d.month; p_occ = occ[m] * (0.75 if d.year == 2023 else 1)
    if random.random() < p_occ * 0.19:
        nights = random.choice([2,2,2,3,3,4,7] if m in (7,8) else [2,2,2,3,4])
        if m in (7,8) and random.random() < .45: nights = 7
        base = {1:185,2:185,3:190,4:205,5:205,6:210,7:235,8:240,9:205,10:210,11:190,12:215}[m] + (d.year-2023)*6
        if d.weekday() >= 4: base += 15
        gross = round(base*nights + 60, 2)
        fee = round(gross*0.03, 2)
        guests = random.choice([2,3,4,4,5,6,6])
        n += 1
        st = 'à venir' if d > today else 'terminée'
        book.append(dict(id=f'HM{random.randint(10**7, 10**8-1)}', guest=random.choice(names), checkin=d.isoformat(), nights=nights, guests=guests,
                         gross=gross, cleaning=60, fee=fee, payout=round(gross-fee, 2), touristTax=round(guests*nights*1.0, 2), status=st, source='Airbnb', demo=True))
        d += dt.timedelta(days=nights + random.randint(1, 4))
    else:
        d += dt.timedelta(days=1)
def add(date, cat, label, amount, rec=False):
    exp.append(dict(date=date.isoformat(), cat=cat, label=label, amount=round(amount, 2), recurring=rec, demo=True))
for y in (2023, 2024, 2025, 2026):
    for mo in range(1, 13):
        dd = D(y, mo, 5)
        if dd < start or dd > today: continue
        add(dd, 'Énergie', 'Électricité (acompte)', 95 + random.uniform(-5, 10), True)
        add(dd, 'Abonnements', 'Internet & wifi', 45, True)
        if mo in (1, 4, 7, 10): add(D(y, mo, 12), 'Énergie', 'Eau (trimestre)', 70 + random.uniform(-10, 15), True)
    if D(y, 1, 20) >= start: add(D(y, 1, 20), 'Assurances', 'Assurance habitation (location courte durée)', 480 + (y-2023)*15, True)
    if D(y, 9, 15) <= today and D(y, 9, 15) >= start: add(D(y, 9, 15), 'Taxes', 'Précompte immobilier', 820 + (y-2023)*20, True)
    if D(y, 10, 10) <= today and D(y, 10, 10) >= start: add(D(y, 10, 10), 'Énergie', 'Bois de chauffage (4 stères)', 340, False)
    if D(y, 3, 10) <= today and D(y, 3, 10) >= start: add(D(y, 3, 10), 'Énergie', 'Mazout / chauffage central', 900 + random.uniform(-80, 120), False)
    if D(y, 4, 2) <= today and D(y, 4, 2) >= start: add(D(y, 4, 2), 'Entretien', 'Ramonage cheminée & entretien chaudière', 210, True)
    for mo in (5, 7, 9):
        if start <= D(y, mo, 20) <= today: add(D(y, mo, 20), 'Entretien', 'Tonte & jardin', 120, False)
    if D(y, 2, 28) <= today and D(y, 2, 28) >= start: add(D(y, 2, 28), 'Comptabilité', 'Comptable / déclaration', 250, True)
for b in book:
    if b['status'] == 'terminée':
        ci = D.fromisoformat(b['checkin'])
        add(ci + dt.timedelta(days=b['nights']), 'Ménage & linge', f"Ménage + linge ({b['guest']})", 75, False)
        add(ci, 'Consommables', 'Produits d\'accueil, café, entretien', 18, False)
        add(ci + dt.timedelta(days=30), 'Taxes', f"Taxe de séjour ({b['guest']})", b['touristTax'], False)
add(D(2023, 3, 15), 'Travaux', 'Mise en conformité (détecteurs, extincteur, attestation incendie)', 640)
add(D(2023, 3, 20), 'Équipement', 'Literie neuve (3 matelas, couettes, oreillers)', 2350)
add(D(2023, 3, 25), 'Équipement', 'Vaisselle, linge de maison, petit électroménager', 980)
add(D(2024, 4, 18), 'Travaux', 'Peinture de la façade ocre', 3800)
add(D(2024, 6, 3), 'Équipement', 'Transats, parasols et barbecue', 520)
add(D(2025, 2, 10), 'Travaux', 'Remplacement du poêle à bois', 2950)
add(D(2025, 5, 22), 'Équipement', 'Enceinte JBL, jeux et livres', 260)
add(D(2026, 3, 12), 'Travaux', 'Rafraîchissement salle de douche du rez', 1850)
book.sort(key=lambda b: b['checkin']); exp.sort(key=lambda e: e['date'])
js = '// DONNÉES D\'EXEMPLE (fictives) générées par tools/gen_demo_finance.py — à remplacer par les données réelles du propriétaire\nwindow.FINANCE_DEMO = ' + json.dumps({'bookings': book, 'expenses': exp}, ensure_ascii=False) + ';\n'
open(os.path.join(os.path.dirname(__file__), '..', 'data', 'finance-demo.js'), 'w', encoding='utf-8').write(js)
print(len(book), 'réservations', len(exp), 'dépenses', 'CA total', round(sum(b['payout'] for b in book)))
