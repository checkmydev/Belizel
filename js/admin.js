/* Belizel — espace propriétaire */
(function(){
const L = window.LISTING, C = window.CONTENT, CFG = window.BELIZEL_CONFIG || {};
const hydrate = (root=document) => $$('[data-i]', root).forEach(el => { el.outerHTML = icon(el.dataset.i); });
$$('.logo').forEach(l => l.innerHTML = LOGO); hydrate();
const eur = (v, d=0) => (v==null||isNaN(v)) ? '–' : new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR',maximumFractionDigits:d}).format(v);
const num = (v, d=1) => (v==null||isNaN(v)) ? '–' : v.toLocaleString('fr-BE',{maximumFractionDigits:d,minimumFractionDigits:d});
const pct = v => Math.round(v*100)+' %';
const median = a => { const s = a.filter(x=>x!=null&&!isNaN(x)).sort((x,y)=>x-y); if(!s.length) return null; const m = s.length>>1; return s.length%2 ? s[m] : (s[m-1]+s[m])/2; };
const quant = (a,q) => { const s = a.filter(x=>x!=null).sort((x,y)=>x-y); if(!s.length) return null; return s[Math.min(s.length-1, Math.floor(q*(s.length-1)))]; };
const MONTHS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const COL = {forest:'#2f4a34', moss:'#76863f', semois:'#3c6e7c', semois2:'#5b93a0', ochre:'#c4552c', wheat:'#d8b46a', ink3:'#8a8473', line:'#e0d5bd'};
Chart.defaults.font.family = '"Nunito Sans", system-ui, sans-serif'; Chart.defaults.color = '#5c584c'; Chart.defaults.borderColor = '#ece3cf';
Chart.defaults.plugins.legend.labels.usePointStyle = true; Chart.defaults.plugins.tooltip.backgroundColor = '#2b2a25'; Chart.defaults.plugins.tooltip.padding = 10;

/* ================= Données : Supabase ou démo locale ================= */
const DB = {
  sb: null, mode: 'demo', email: null,
  bookings: [], expenses: [], comps: null, manual: null, stories: null, guestCode: 'IZEL2027',
  async init(){
    if(CFG.anonKey && window.supabase){
      this.sb = window.supabase.createClient(CFG.supabaseUrl, CFG.anonKey, {db:{schema: CFG.schema}});
      const { data } = await this.sb.auth.getSession();
      if(!data.session) return false;
      this.email = data.session.user.email;
      const ok = await this.sb.rpc('is_admin'); if(!ok.data){ toast('Ce compte n\'est pas autorisé.'); await this.sb.auth.signOut(); return false; }
      this.mode = 'live'; await this.loadLive(); return true;
    }
    this.loadDemo(); return true;
  },
  async loadLive(){
    const q = async (t, o) => { const r = await this.sb.from(t).select('*').order(o, {ascending:true}); if(r.error) throw r.error; return r.data; };
    this.bookings = (await q('bookings','checkin')).map(b => ({...b, touristTax: b.tourist_tax}));
    this.expenses = await q('expenses','date');
    const cs = await this.sb.from('comps_snapshots').select('data,scraped').order('scraped',{ascending:false}).limit(1);
    this.comps = cs.data?.[0]?.data || window.COMPS || null;
    const m = await this.sb.from('manual').select('*').eq('id',1).maybeSingle();
    this.manual = m.data?.data || structuredClone(window.MANUAL); this.guestCode = m.data?.guest_code || this.guestCode;
    const s = await this.sb.from('content').select('data').eq('key','stories').maybeSingle();
    this.stories = s.data?.data || structuredClone(window.STORIES || []);
  },
  loadDemo(){
    const fd = window.FINANCE_DEMO || {bookings:[],expenses:[]};
    this.bookings = store.get('adm.bookings', null) || fd.bookings.map((b,i) => ({...b, uid:'b'+i}));
    this.expenses = store.get('adm.expenses', null) || fd.expenses.map((e,i) => ({...e, uid:'e'+i}));
    this.comps = window.COMPS || null;
    this.manual = store.get('adm.manual', null) || structuredClone(window.MANUAL);
    this.stories = store.get('adm.stories', null) || structuredClone(window.STORIES || []);
    this.guestCode = store.get('adm.gcode', 'IZEL2027');
  },
  key: r => r.id || r.uid,
  async saveRow(kind, row){
    const list = kind==='b' ? this.bookings : this.expenses;
    if(this.mode==='live'){
      const t = kind==='b' ? 'bookings' : 'expenses';
      const rec = {...row}; delete rec.uid; if(kind==='b'){ rec.tourist_tax = rec.touristTax||0; delete rec.touristTax; }
      const r = rec.id ? await this.sb.from(t).update(rec).eq('id', rec.id).select().single() : await this.sb.from(t).insert(rec).select().single();
      if(r.error) throw r.error; row = kind==='b' ? {...r.data, touristTax:r.data.tourist_tax} : r.data;
    } else if(!row.uid) row.uid = kind + Date.now() + Math.random().toString(36).slice(2,6);
    const i = list.findIndex(x => this.key(x)===this.key(row)); if(i>=0) list[i] = row; else list.push(row);
    this.persist(); return row;
  },
  async delRow(kind, k){
    const list = kind==='b' ? this.bookings : this.expenses;
    if(this.mode==='live'){ const r = await this.sb.from(kind==='b'?'bookings':'expenses').delete().eq('id', k); if(r.error) throw r.error; }
    const i = list.findIndex(x => this.key(x)===k); if(i>=0) list.splice(i,1); this.persist();
  },
  async bulkBookings(rows){
    if(this.mode==='live'){ const r = await this.sb.from('bookings').upsert(rows.map(b => { const x = {...b, tourist_tax:b.touristTax||0}; delete x.touristTax; delete x.uid; return x; }), {onConflict:'ext_ref'}).select();
      if(r.error) throw r.error; await this.loadLive(); return; }
    rows.forEach(b => { const i = this.bookings.findIndex(x => x.id && x.id===b.id); if(i>=0) this.bookings[i] = {...this.bookings[i], ...b}; else this.bookings.push({...b, uid:'b'+Math.random().toString(36).slice(2)}); });
    this.persist();
  },
  async saveContent(){
    if(this.mode==='live'){
      const a = await this.sb.from('manual').upsert({id:1, data:this.manual, guest_code:this.guestCode, updated_at:new Date().toISOString()}); if(a.error) throw a.error;
      const b = await this.sb.from('content').upsert({key:'stories', data:this.stories, updated_at:new Date().toISOString(), updated_by:this.email}); if(b.error) throw b.error;
    } else { store.set('adm.manual', this.manual); store.set('adm.stories', this.stories); store.set('adm.gcode', this.guestCode); }
  },
  persist(){ if(this.mode==='demo'){ store.set('adm.bookings', this.bookings); store.set('adm.expenses', this.expenses); } }
};

/* ================= Démarrage ================= */
async function boot(){
  const ok = await DB.init().catch(e => { console.error(e); return false; });
  if(!ok){ $('#login').hidden = false; return; }
  $('#login').hidden = true; $('#shell').hidden = false;
  $('#modeBadge').innerHTML = DB.mode==='live' ? `<div class="mode"><b>● Connecté</b>${esc(DB.email)}<br>Données Supabase (schéma belizel)</div>`
    : `<div class="mode"><b>● Mode démonstration</b>Données d'exemple et modifications enregistrées dans ce navigateur.</div>`;
  $('#logout').hidden = DB.mode!=='live';
  initComps(); renderSynthese(); go(location.hash.slice(1) || 'synthese');
  if(!store.get('adm.toured', false)) setTimeout(startTour, 900);
}
$('#loginForm').onsubmit = async e => { e.preventDefault(); $('#lgMsg').textContent = 'Connexion…';
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.anonKey, {db:{schema:CFG.schema}});
  const r = await sb.auth.signInWithPassword({email:$('#lgEmail').value, password:$('#lgPass').value});
  if(r.error){ $('#lgMsg').textContent = 'Identifiants incorrects.'; return; } location.reload(); };
$('#logout').onclick = async () => { await DB.sb.auth.signOut(); location.reload(); };

/* ================= Navigation ================= */
const TITLES = {synthese:['Synthèse','Vue d\'ensemble et priorités'],marche:['Marché & prix','Positionnement face aux annonces du secteur'],calendrier:['Tarifs & saisons','Saisonnalité, événements et simulateur'],
  avis:['Avis','Satisfaction des voyageurs vs concurrence'],equipements:['Équipements','Ce qui fait la différence'],annonce:['Annonce','Optimiser la page Airbnb'],finances:['Finances','Rentrées, sorties et rentabilité'],contenus:['Contenus du guide','Mode d\'emploi, accès invités et histoires']};
const rendered = {};
function go(t){
  if(!TITLES[t]) t = 'synthese';
  $$('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab===t)); $$('.tab').forEach(s => s.classList.toggle('on', s.id==='t-'+t));
  $('#tabTitle').textContent = TITLES[t][0]; $('#tabSub').textContent = TITLES[t][1]; history.replaceState(null,'','#'+t); $('#side').classList.remove('open');
  if(!rendered[t]){ rendered[t] = true; ({marche:renderMarche, calendrier:renderCal, avis:renderAvis, equipements:renderAmen, annonce:renderAnnonce, finances:renderFin, contenus:renderContent}[t]||(()=>{}))(); }
  if(t==='marche' && cMap) setTimeout(()=>cMap.invalidateSize(), 50);
}
addEventListener('hashchange', () => { const t = location.hash.slice(1); if(TITLES[t]) go(t); });
$('#tabs').onclick = e => { const a = e.target.closest('a'); if(a) go(a.dataset.tab); };
$('#menuBtn').onclick = () => $('#side').classList.toggle('open');
function openDrawer(title, html){ $('#dTitle').innerHTML = title; $('#dBody').innerHTML = html; $('#drawer').classList.add('on'); $('#drawerBg').classList.add('on'); }
function closeDrawer(){ $('#drawer').classList.remove('on'); $('#drawerBg').classList.remove('on'); }
$('#dClose').onclick = closeDrawer; $('#drawerBg').onclick = closeDrawer;

/* ================= Concurrence : préparation ================= */
let CO, SELF, SCEN;
function initComps(){
  CO = DB.comps; if(!CO){ return; }
  SCEN = CO.scenarios; SELF = CO.listings.find(l => l.self) || {prices:{}, cats:L.cats, tags:L.tags, rating:L.rating, reviews:L.reviews, amen:[]};
  SELF.cats = L.cats; // valeurs précises de la fiche
}
function comparables({cap='5-8', km=15} = {}){
  const [a,b] = cap.split('-').map(Number);
  return CO.listings.filter(l => !l.self && l.cap && l.cap>=a && l.cap<=b && l.km<=km);
}
function priceOf(l, sc){ const p = l.prices?.[sc]; return p && p.nightly ? p.nightly : null; }
function scenMedians(list){ const o = {}; Object.keys(SCEN).forEach(sc => o[sc] = median(list.map(l => priceOf(l, sc)))); return o; }

/* ================= Synthèse ================= */
let charts = {};
function mk(id, cfg){ charts[id]?.destroy(); charts[id] = new Chart($('#'+id), cfg); return charts[id]; }
function finYear(y){
  const b = DB.bookings.filter(x => x.checkin.startsWith(y)), e = DB.expenses.filter(x => x.date.startsWith(y));
  const rev = b.reduce((s,x)=>s+(+x.payout||0),0), exp = e.reduce((s,x)=>s+(+x.amount||0),0), nights = b.reduce((s,x)=>s+(+x.nights||0),0);
  return {b, e, rev, exp, nights, net: rev-exp};
}
function renderSynthese(){
  const comp = CO ? comparables() : [];
  const sc = 'hiver_semaine';
  const med = CO ? median(comp.map(l=>priceOf(l,sc))) : null, mine = SELF?.prices?.[sc]?.nightly || L.price2027.hiver_semaine;
  const rated = comp.filter(l => l.rating); const better = rated.filter(l => l.rating > L.rating).length;
  const y = String(new Date().getFullYear()); const fy = finYear(y); const days = Math.round((new Date() - new Date(y+'-01-01'))/864e5);
  const occ = fy.b.filter(b=>b.status!=='à venir').reduce((s,x)=>s+(+x.nights||0),0) / Math.max(1,days);
  $('#kpis').innerHTML = [
    ['Prix par nuit (hiver)', eur(mine), med?`médiane du marché ${eur(med)} · <span class="${mine>=med?'up':'down'}">${mine>=med?'+':''}${Math.round((mine/med-1)*100)} %</span>`:''],
    ['Note globale', '★ '+num(L.rating,2), `${L.reviews} avis · ${better} concurrent${better>1?'s':''} sur ${rated.length} mieux noté${better>1?'s':''}`],
    ['Revenus versés '+y, eur(fy.rev), `${fy.b.length} réservations · ${fy.nights} nuits`],
    ['Résultat net '+y, eur(fy.net), `dépenses ${eur(fy.exp)}`],
    ['Taux d\'occupation '+y, pct(occ), 'nuits réservées / jours écoulés']
  ].map(([s,b,t]) => `<div class="kpi"><small>${s}</small><b>${b}</b><span>${t}</span></div>`).join('');
  $('#reco').innerHTML = recommendations().map(r => `<li><div><b>${r.t}<span class="tag ${r.lvl}">${{hi:'impact fort',md:'impact moyen',lo:'rapide'}[r.lvl]}</span></b><p>${r.d}</p></div></li>`).join('');
  if(CO){
    const sorted = comp.map(l => ({n:l.name, p:priceOf(l,sc)})).filter(x=>x.p).sort((a,b)=>a.p-b.p);
    sorted.push({n:'Belizel', p:mine, self:true}); sorted.sort((a,b)=>a.p-b.p);
    mk('cPosition',{type:'bar',data:{labels:sorted.map(x=>x.n),datasets:[{data:sorted.map(x=>x.p),backgroundColor:sorted.map(x=>x.self?COL.ochre:'#cfd9c7'),borderRadius:4,barPercentage:.9,categoryPercentage:1}]},
      options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>eur(c.raw)+' / nuit'}}},scales:{x:{display:false},y:{ticks:{callback:v=>v+' €'},grid:{color:'#f0e8d6'}}}}});
  }
  const months = Array.from({length:12},(_,i)=>{ const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-11+i); return d.toISOString().slice(0,7); });
  mk('cMini',{type:'bar',data:{labels:months.map(m=>MONTHS[+m.slice(5)-1]),datasets:[
    {label:'Revenus',data:months.map(m=>DB.bookings.filter(b=>b.checkin.startsWith(m)).reduce((s,b)=>s+(+b.payout||0),0)),backgroundColor:COL.forest,borderRadius:4},
    {label:'Dépenses',data:months.map(m=>-DB.expenses.filter(e=>e.date.startsWith(m)).reduce((s,e)=>s+(+e.amount||0),0)),backgroundColor:COL.ochre,borderRadius:4}]},
    options:{plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+' : '+eur(Math.abs(c.raw))}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{callback:v=>v/1000+' k€'}}}}});
}
function recommendations(){
  const R = [];
  if(!CO) return [{lvl:'hi',t:'Charger l\'analyse concurrentielle',d:'Aucune donnée de marché n\'est disponible.'}];
  const comp = comparables(); const meds = scenMedians(comp); const mine = SELF.prices || {};
  const unavailable = Object.keys(SCEN).filter(sc => !mine[sc]);
  const revComp = comparables({cap:'1-99', km:25}).filter(l => l.reviews >= 3); const catMed = k => median(revComp.map(l=>l.cats?.[k]));
  const cleanGap = L.cats.cleanliness - catMed('cleanliness');
  const has = a => comp.filter(l => l.amen.includes(a)).length / comp.length;
  const amenMine = new Set(SELF.amen);
  if(meds.automne_we && meds.printemps_we) R.push({lvl:'hi',t:'Tarifs saisonniers et week-end',
    d:`Belizel affiche ${eur(mine.hiver_semaine?.nightly||207.5)} toute l'année, alors que la médiane du marché monte à ${eur(meds.printemps_we)} au printemps (week-end) et ${eur(meds.automne_we)} en automne (week-end). Activez une majoration week-end (+12 à +15 %) et des prix de haute saison (juillet-août, vacances belges, Toussaint) : environ +2 500 € par an à occupation égale.`});
  if(unavailable.length) R.push({lvl:'md',t:'Ouvrir le calendrier plus loin',d:`Aux dates testées (${unavailable.map(s=>SCEN[s].label.toLowerCase()).join(', ')}), Belizel n'était pas réservable. Si ce n'est pas déjà réservé, ouvrez le calendrier 12 mois à l'avance : les familles réservent l'été dès janvier.`});
  if(cleanGap < 0) R.push({lvl:'hi',t:'Propreté : la seule note sous le marché',d:`Propreté à ${num(L.cats.cleanliness,2)} contre ${num(catMed('cleanliness'),2)} en médiane chez les concurrents. C'est le critère qui bloque le badge « Coup de cœur voyageurs » (il faut dépasser 4,8 environ partout). Check-list de ménage avec photos, linge contrôlé, vitres et salle de douche du rez.`});
  R.push({lvl:'hi',t:'Viser le badge « Coup de cœur voyageurs »',d:`${comp.filter(l=>l.guestFav).length} concurrents comparables l'affichent : il fait remonter l'annonce dans les recherches. Avec ${num(L.rating,2)} de moyenne, Belizel en est proche : propreté, plus quelques avis 5★ récents (message de départ qui invite à laisser un avis).`});
  const gaps = ['Arrivée autonome','Télévision','Chaise haute','Animaux acceptés','Sèche-linge','Café offert','Entrée privée'].filter(a => !amenMine.has(a)).map(a => ({a, p:has(a)})).filter(x=>x.p>=.2).sort((a,b)=>b.p-a.p);
  if(gaps.length) R.push({lvl:'md',t:'Compléter les équipements les plus demandés',d:gaps.slice(0,5).map(g=>`${g.a} (${pct(g.p)} des concurrents)`).join(', ')+'. Certains sont peut-être déjà présents mais pas cochés dans l\'annonce : à vérifier en premier, c\'est gratuit.'});
  if(has('Animaux acceptés') > .3) R.push({lvl:'md',t:'Envisager les chiens (avec supplément)',d:`${pct(has('Animaux acceptés'))} des maisons comparables acceptent les animaux. Les randonneurs viennent souvent avec leur chien : un supplément de 25 à 40 € par séjour couvre le ménage additionnel.`});
  R.push({lvl:'lo',t:'Titre et description',d:'Ajoutez les mots-clés recherchés (poêle à bois, jardin, Orval, Semois, 6 personnes) et corrigez l\'incohérence « trois lits doubles » de la description (2 queen + 1 king + 2 lits simples). Voir l\'onglet Annonce.'});
  R.push({lvl:'lo',t:'Envoyer ce guide aux voyageurs',d:'Ajoutez le lien du guide (avec le code invité) au message de confirmation : moins de questions, de meilleures notes « Arrivée » et « Communication », et des voyageurs qui profitent mieux de la région.'});
  return R;
}

/* ================= Marché ================= */
let cMap, cMapLayer;
function renderMarche(){
  if(!CO) return $('#t-marche').innerHTML = '<div class="banner">Aucune donnée de concurrence.</div>';
  $('#mScen').innerHTML = Object.entries(SCEN).map(([k,v]) => `<option value="${k}">${v.label} (${v.dates})</option>`).join('');
  ['mScen','mCap','mKm'].forEach(id => $('#'+id).onchange = drawMarche);
  cMap = window.L.map('cMap',{scrollWheelZoom:false}).setView([L.lat,L.lng],11);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(cMap);
  cMapLayer = window.L.layerGroup().addTo(cMap);
  drawMarche();
}
let sortK = 'p', sortD = 1;
function drawMarche(){
  const sc = $('#mScen').value, list = comparables({cap:$('#mCap').value, km:+$('#mKm').value});
  const withP = list.filter(l => priceOf(l,sc));
  const med = median(withP.map(l=>priceOf(l,sc)));
  $('#mInfo').textContent = `${list.length} annonces · ${withP.length} disponibles à ces dates · médiane ${eur(med)} / nuit`;
  const pts = withP.map(l => ({x:priceOf(l,sc), y:l.rating||null, r:Math.max(4,Math.sqrt(l.reviews||1)*1.6), l})).filter(p=>p.y);
  const mp = priceOf(SELF,sc);
  mk('cScatter',{type:'bubble',data:{datasets:[
    {label:'Concurrents',data:pts,backgroundColor:pts.map(p=>p.l.guestFav?'rgba(47,74,52,.65)':'rgba(91,147,160,.45)'),borderColor:'#fff'},
    ...(mp?[{label:'Belizel',order:-1,data:[{x:mp,y:L.rating,r:Math.sqrt(L.reviews)*1.6+3}],backgroundColor:COL.ochre,borderColor:'#2b2a25',borderWidth:2}]:[])]},
    options:{plugins:{tooltip:{callbacks:{label:c=>{ const l = c.raw.l; return l ? `${l.name} · ${eur(c.raw.x)} · ★${num(c.raw.y,2)} (${l.reviews})` : `Belizel · ${eur(c.raw.x)} · ★${num(L.rating,2)}`; }}}},
      scales:{x:{title:{display:true,text:'Prix par nuit'},ticks:{callback:v=>v+' €'}},y:{title:{display:true,text:'Note'},min:4.2,max:5.02}}}});
  // carte
  cMapLayer.clearLayers(); const ps = withP.map(l=>priceOf(l,sc)); const lo = quant(ps,.1), hi = quant(ps,.9);
  const color = p => { if(!p) return '#aaa'; const t = Math.max(0,Math.min(1,(p-lo)/((hi-lo)||1))); const a=[118,134,63], b=[196,85,44]; return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`; };
  list.forEach(l => window.L.circleMarker([l.lat,l.lng],{radius:7+Math.min(8,(l.cap||6)/2),color:'#fff',weight:2,fillColor:color(priceOf(l,sc)),fillOpacity:.9})
    .bindTooltip(`<b>${esc(l.name)}</b><br>${priceOf(l,sc)?eur(priceOf(l,sc))+' / nuit':'indisponible'} · ${l.cap} pers. · ★${l.rating||'–'}`).addTo(cMapLayer));
  window.L.marker([L.lat,L.lng],{icon:window.L.divIcon({className:'',html:'<div class="pin pin-house" style="width:34px;height:34px"><span style="font-size:15px">🏡</span></div>',iconSize:[34,34],iconAnchor:[17,34]})}).addTo(cMapLayer).bindTooltip('Belizel');
  // table
  const rows = [...list, SELF].map(l => ({l, p:priceOf(l,sc), r:l.rating, n:l.reviews, k:l.km, c:l.cap}));
  const keyf = {p:x=>x.p??1e9, r:x=>-(x.r||0), n:x=>-(x.n||0), k:x=>x.k??0, c:x=>x.c||0, name:x=>x.l.name};
  rows.sort((a,b) => { const A = keyf[sortK](a), B = keyf[sortK](b); return (A>B?1:A<B?-1:0)*sortD; });
  $('#mTable').innerHTML = `<thead><tr><th data-s="name">Annonce</th><th data-s="k" class="num">Distance</th><th data-s="c" class="num">Pers.</th><th>Chambres</th><th data-s="p" class="num">Prix / nuit</th><th data-s="r" class="num">Note</th><th data-s="n" class="num">Avis</th><th>Badges</th><th></th></tr></thead><tbody>${
    rows.map(x => `<tr class="${x.l.self?'self':''}"><td>${esc(x.l.name)}<br><small class="muted">${esc(x.l.type)} · ${esc(x.l.town||'')}</small></td><td class="num">${x.l.self?'–':num(x.k)+' km'}</td><td class="num">${x.c||'–'}</td><td><small>${esc((x.l.info||[]).slice(0,2).join(' · '))}</small></td>
    <td class="num">${x.p?eur(x.p):'<small class="muted">indispo.</small>'}</td><td class="num">${x.r?num(x.r,2):'<small class="muted">nouveau</small>'}</td><td class="num">${x.n||0}</td>
    <td>${x.l.guestFav?'<span class="pill fav">Coup de cœur</span> ':''}${x.l.superhost?'<span class="pill sh">Superhôte</span>':''}</td><td><a href="https://www.airbnb.be/rooms/${x.l.id}" target="_blank" rel="noopener">↗</a></td></tr>`).join('')}</tbody>`;
  $$('#mTable th[data-s]').forEach(th => th.onclick = () => { const k = th.dataset.s; sortD = sortK===k ? -sortD : 1; sortK = k; drawMarche(); });
}

/* ================= Tarifs & saisons ================= */
function renderCal(){
  if(!CO) return;
  const comp = comparables(); const meds = scenMedians(comp); const keys = Object.keys(SCEN);
  mk('cSeason',{type:'bar',data:{labels:keys.map(k=>SCEN[k].label),datasets:[
    {label:'Médiane du marché',data:keys.map(k=>meds[k]),backgroundColor:'#cfd9c7',borderRadius:6},
    {label:'Belizel',data:keys.map(k=>SELF.prices?.[k]?.nightly||null),backgroundColor:COL.ochre,borderRadius:6}]},
    options:{plugins:{tooltip:{callbacks:{label:c=>c.raw?`${c.dataset.label} : ${eur(c.raw)}`:`${c.dataset.label} : indisponible`}}},scales:{y:{ticks:{callback:v=>v+' €'}}}}});
  // calendrier suggéré : base hiver de Belizel × indice saisonnier du marché
  const base = SELF.prices?.hiver_semaine?.nightly || L.price2027.hiver_semaine;
  const idx = {1:1,2:1,3:1.02,4:1.08,5:1.1,6:1.12,7:1.22,8:1.25,9:1.08,10:1.12,11:1.03,12:1.12};
  const evBump = {}; C.events.forEach(e => { if(e.month && ['festival'].includes(e.category)) (evBump[e.month] = evBump[e.month]||[]).push(e.name); });
  const start = new Date(); start.setDate(1);
  $('#calGrid').innerHTML = Array.from({length:12},(_,i) => { const d = new Date(start.getFullYear(), start.getMonth()+i, 1); const m = d.getMonth()+1;
    const wk = Math.round(base*idx[m]/5)*5, we = Math.round(wk*1.14/5)*5; const t = (idx[m]-1)/.25;
    const bg = `linear-gradient(160deg, ${t>.6?'#c4552c':t>.3?'#b8813a':'#3f6145'}, ${t>.6?'#9a3c18':t>.3?'#8a6a2c':'#2f4a34'})`;
    return `<div class="calm" style="background:${bg}" data-m="${m}"><small>${MONTHS[m-1]} ${d.getFullYear()}</small><b>${eur(wk)}</b><span>week-end ${eur(we)}</span>${evBump[m]?`<span class="ev">🎪 ${esc(evBump[m][0])}${evBump[m].length>1?' +'+(evBump[m].length-1):''}</span>`:''}</div>`; }).join('');
  $('#calGrid').onclick = e => { const c = e.target.closest('.calm'); if(!c) return; const m = +c.dataset.m; const evs = C.events.filter(x => x.month===m);
    openDrawer(`<h3>${MONTHS[m-1]} : tarification</h3>`, `<p>Indice saisonnier : <b>${Math.round((idx[m]-1)*100)} %</b> au-dessus de la base hiver (${eur(base)}).</p>
      <h4>Événements du mois</h4>${evs.length?`<ul>${evs.map(x=>`<li><b>${esc(x.name)}</b> — ${esc(x.dates)} (${esc(x.place)})</li>`).join('')}</ul><p class="muted">Pendant les grands festivals (Chassepierre, Gaume Jazz, Médiévales), appliquez +15 à +25 % sur les nuits concernées et un séjour minimum de 2 nuits.</p>`:'<p class="muted">Pas de grand événement : misez sur les réductions à la semaine (-10 %) et de dernière minute.</p>'}`); };
  // simulateur
  const fy = finYear(String(new Date().getFullYear()-1)); const s0 = {p: Math.round(base), o: Math.round(Math.min(80, fy.nights/365*100)) || 35, l: 2.5, c: 60};
  [['sP','p'],['sO','o'],['sL','l'],['sC','c']].forEach(([id,k]) => { $('#'+id).value = s0[k]; $('#'+id).oninput = sim; }); sim();
  function sim(){
    const p = +$('#sP').value, o = +$('#sO').value/100, l = +$('#sL').value, c = +$('#sC').value;
    $('#sPv').textContent = eur(p); $('#sOv').textContent = Math.round(o*100)+' %'; $('#sLv').textContent = num(l,1)+' nuits'; $('#sCv').textContent = eur(c);
    const nights = 365*o, stays = nights/l, gross = nights*p + stays*c, net = gross*0.97;
    const ref = 365*(s0.o/100)*s0.p + 365*(s0.o/100)/s0.l*s0.c;
    $('#simOut').innerHTML = [['Nuits vendues', Math.round(nights), ''], ['Séjours', Math.round(stays), ''], ['Revenu brut annuel', eur(gross), ''], ['Versé (après frais Airbnb 3 %)', eur(net), `<span class="${gross>=ref?'up':'down'}">${gross>=ref?'+':''}${eur(gross-ref)} vs situation actuelle</span>`]]
      .map(([s,b,t]) => `<div class="kpi"><small>${s}</small><b>${b}</b><span>${t}</span></div>`).join('');
  }
}

/* ================= Avis ================= */
function renderAvis(){
  if(!CO) return;
  const comp = comparables({cap:'1-99', km:25}).filter(l => l.reviews >= 3);
  const CATN = {cleanliness:'Propreté',accuracy:'Exactitude',checkin:'Arrivée',communication:'Communication',location:'Emplacement',value:'Qualité-prix'};
  const ks = Object.keys(CATN);
  mk('cCats',{type:'bar',data:{labels:ks.map(k=>CATN[k]),datasets:[
    {label:'Belizel',data:ks.map(k=>L.cats[k]),backgroundColor:COL.ochre,borderRadius:5},
    {label:'Médiane concurrents',data:ks.map(k=>median(comp.map(l=>l.cats?.[k]))),backgroundColor:'#cfd9c7',borderRadius:5},
    {label:'Top 25 %',data:ks.map(k=>quant(comp.map(l=>l.cats?.[k]),.75)),backgroundColor:COL.forest,borderRadius:5}]},
    options:{indexAxis:'y',scales:{x:{min:4.3,max:5}},plugins:{tooltip:{callbacks:{label:c=>`${c.dataset.label} : ${num(c.raw,2)}`}}}}});
  mk('cRevs',{type:'scatter',data:{datasets:[
    {label:'Concurrents',data:comp.map(l=>({x:l.reviews,y:l.rating,l})),pointRadius:6,backgroundColor:comp.map(l=>l.guestFav?COL.forest:'rgba(91,147,160,.55)')},
    {label:'Belizel',data:[{x:L.reviews,y:L.rating}],pointRadius:10,backgroundColor:COL.ochre}]},
    options:{scales:{x:{type:'logarithmic',title:{display:true,text:'Nombre d\'avis (échelle log)'}},y:{min:4,max:5.02,title:{display:true,text:'Note'}}},
      plugins:{tooltip:{callbacks:{label:c=>c.raw.l?`${c.raw.l.name} · ★${num(c.raw.y,2)} · ${c.raw.x} avis`:`Belizel · ★${num(L.rating,2)} · ${L.reviews} avis`}}}}});
  const withTags = comp.filter(l => l.tags && Object.keys(l.tags).length);
  const allTags = [...new Set(withTags.flatMap(l => Object.keys(l.tags)).concat(Object.keys(L.tags)))];
  const rows = allTags.map(t => ({t, share: withTags.filter(l=>l.tags[t]).length/withTags.length, mine: L.tags[t]||0, mineShare:(L.tags[t]||0)/L.reviews})).sort((a,b)=>b.share-a.share).slice(0,14);
  $('#tagCmp').innerHTML = `<div class="tagrow muted small" style="font-weight:800"><span>Thème</span><span>Annonces concurrentes</span><span>Belizel (mentions / avis)</span></div>` + rows.map(r => `<div class="tagrow"><span>${esc(r.t)}</span>
    <div class="arow" style="grid-template-columns:1fr 40px;padding:0"><div class="track"><div class="fill" style="width:${r.share*100}%"></div></div><small>${pct(r.share)}</small></div>
    <div class="arow ${r.mine?'':'miss'}" style="grid-template-columns:1fr 40px;padding:0"><div class="track"><div class="fill" style="width:${Math.min(100,r.mineShare*100)}%;background:${r.mine?COL.ochre:'transparent'}"></div></div><small>${r.mine||'–'}</small></div></div>`).join('');
  const med = k => median(comp.map(l=>l.cats?.[k]));
  $('#avisTxt').innerHTML = `<p><b>Points forts.</b> Arrivée (${num(L.cats.checkin,2)}) et communication (${num(L.cats.communication,2)}) sont au niveau des meilleures annonces : « hospitalité » est d'ailleurs le thème le plus cité (${L.tags['Hospitalité']} mentions).</p>
    <p><b>À travailler.</b> La propreté (${num(L.cats.cleanliness,2)}) est sous la médiane (${num(med('cleanliness'),2)}) et loin du top 25 % (${num(quant(comp.map(l=>l.cats?.cleanliness),.75),2)}). C'est la note qui pèse le plus sur l'algorithme de classement d'Airbnb.</p>
    <p><b>Volume d'avis.</b> ${L.reviews} avis, contre une médiane de ${median(comp.map(l=>l.reviews))} chez les concurrents. Un message de départ chaleureux, avec un lien vers l'avis, augmente le taux de réponse.</p>
    <p class="muted small">Le texte intégral des commentaires n'est pas accessible publiquement : l'analyse repose sur les notes par catégorie et les thèmes détectés par Airbnb.</p>`;
}

/* ================= Équipements ================= */
const AMEN_MINE = new Set(['Wifi','Espace de travail','Feu de bois / poêle','Chauffage','Lave-vaisselle','Lave-linge','Cafetière','Barbecue','Jardin','Baignoire','Lit bébé','Jouets enfants','Jeux de société','Enceinte Bluetooth','Climatisation','Parking sur place','Belle vue']);
function renderAmen(){
  if(!CO) return;
  const comp = comparables({cap:'4-10', km:20}); const mine = new Set([...(SELF.amen||[]), ...AMEN_MINE]);
  const all = [...new Set(comp.flatMap(l=>l.amen))];
  const rows = all.map(a => ({a, p: comp.filter(l=>l.amen.includes(a)).length/comp.length, m: mine.has(a)})).filter(r => r.p >= .05).sort((x,y)=>y.p-x.p);
  $('#amenCmp').innerHTML = rows.map(r => `<div class="arow ${r.m?'':'miss'}"><span class="st">${r.m?'✅':'➕'}</span><span>${esc(r.a)}</span><div class="track"><div class="fill" style="width:${r.p*100}%"></div></div><small>${pct(r.p)}</small></div>`).join('') +
    `<p class="muted small" style="grid-column:1/-1;margin-top:12px">✅ présent chez Belizel · ➕ absent ou non déclaré dans l'annonce. Base : ${comp.length} annonces de 4 à 10 voyageurs dans un rayon de 20 km.</p>`;
}

/* ================= Annonce ================= */
function renderAnnonce(){
  const titles = ['Belizel · maison gaumaise, poêle à bois & jardin','Maison 6 pers. près d\'Orval · feu de bois · Semois','Belizel · 3 ch., jardin, forêts et Semois à pied','Gîte de charme en Gaume · 6 pers. · poêle & jardin'];
  $('#titles').innerHTML = titles.map(t => `<div class="titleopt"><span>${esc(t)}</span><small>${t.length}/50</small><button class="btn btn-soft btn-sm" data-copy="${esc(t)}">Copier</button></div>`).join('');
  const CL = [
    [false,'Description : « trois lits doubles » contredit le détail des couchages (2 queen, 1 king, 2 lits simples). À corriger.'],
    [false,'Premier paragraphe : citer Orval (6 km), la Semois et les balades au départ de la maison (Le Bois des Huttes, 400 m).'],
    [true,'Photos de saison (neige, automne, printemps) : un vrai atout, à garder en fin de galerie.'],
    [false,'Photo de couverture : façade côté jardin en été, ou living avec le poêle allumé (ambiance cocooning, très cliquée en hiver).'],
    [false,'Déclarer les équipements peut-être présents mais non cochés : télévision ? cintres ? chaise haute ? entrée privée ?'],
    [false,'Activer l\'arrivée autonome (boîte à clés) : filtre très utilisé, et note « Arrivée » déjà à 5,0.'],
    [true,'Réactivité : réponse en moins d\'une heure, 100 % de taux de réponse.'],
    [false,'Règles : préciser les heures d\'arrivée et de départ, ainsi que la politique d\'annulation (absentes du texte).'],
    [false,'Réduction à la semaine (-10 %) et au mois : capte les séjours d\'été et de télétravail.'],
    [false,'Ajouter le lien du guide Belizel dans le message de confirmation (onglet Contenus).']
  ];
  $('#checklist').innerHTML = CL.map(([ok,t]) => `<div class="chk"><span class="st">${ok?'✅':'⬜'}</span><span>${t}</span></div>`).join('');
  let order = store.get('adm.photoOrder', ['img/p01.jpg','img/p04.jpg','img/p02.jpg','img/p08.jpg','img/p06.jpg','img/p16.jpg','img/p20.jpg','img/p09.jpg','img/p10.jpg','img/p03.jpg','img/p17.jpg','img/p18.jpg','img/p07.jpg','img/p13.jpg','img/p14.jpg','img/p12.jpg','img/p23.jpg','img/p26.jpg']);
  const draw = () => { $('#photoOrder').innerHTML = order.map((s,i) => `<figure draggable="true" data-i="${i}" class="${i<5?'top5':''}"><img src="${s}" alt=""><figcaption>${i+1}</figcaption></figure>`).join(''); };
  let from = null;
  $('#photoOrder').ondragstart = e => { from = +e.target.closest('figure').dataset.i; };
  $('#photoOrder').ondragover = e => e.preventDefault();
  $('#photoOrder').ondrop = e => { e.preventDefault(); const f = e.target.closest('figure'); if(!f || from==null) return; const to = +f.dataset.i; const [x] = order.splice(from,1); order.splice(to,0,x); store.set('adm.photoOrder', order); draw(); };
  draw();
  $('#welcomeMsg').value = `Bonjour {prénom},\n\nMerci pour votre réservation à Belizel ! Nous avons hâte de vous accueillir à Izel.\n\nTout ce qu'il faut savoir pour votre séjour (arrivée, wifi, poêle, balades à télécharger, restaurants et agenda des événements) se trouve dans notre guide :\n${guestLink()}\n\nCode d'accès au mode d'emploi : ${DB.guestCode}\n\nArrivée à partir de 16 h, départ avant 11 h. N'hésitez pas à nous écrire ici pour toute question.\n\nÀ très bientôt en Gaume !`;
  $('#cpMsg').onclick = () => navigator.clipboard.writeText($('#welcomeMsg').value).then(()=>toast('Message copié'));
}
document.addEventListener('click', e => { const b = e.target.closest('[data-copy]'); if(b) navigator.clipboard.writeText(b.dataset.copy).then(()=>toast('Copié')); });
function guestLink(){ const base = location.href.replace(/admin\.html.*$/,''); return `${base}?code=${encodeURIComponent(DB.guestCode)}#infos`; }

/* ================= Finances ================= */
const ECATS = ['Travaux','Équipement','Entretien','Énergie','Ménage & linge','Consommables','Assurances','Taxes','Abonnements','Comptabilité','Autre'];
function renderFin(){
  const years = [...new Set([...DB.bookings.map(b=>b.checkin.slice(0,4)), ...DB.expenses.map(e=>e.date.slice(0,4)), String(new Date().getFullYear())])].sort().reverse();
  $('#fYear').innerHTML = `<option value="all">Toutes</option>` + years.map(y=>`<option ${y===String(new Date().getFullYear())?'selected':''}>${y}</option>`).join('');
  $('#fYear').onchange = drawFin; drawFin();
  $('#fImport').onclick = () => $('#fFile').click(); $('#fFile').onchange = importCsv;
  $('#fAddB').onclick = () => editBooking(); $('#fAddE').onclick = () => editExpense();
  $('#fExport').onclick = exportFin; $('#fNeeds').onclick = needs;
}
function drawFin(){
  const y = $('#fYear').value; const inY = d => y==='all' || d.startsWith(y);
  const b = DB.bookings.filter(x=>inY(x.checkin)), e = DB.expenses.filter(x=>inY(x.date));
  const rev = b.reduce((s,x)=>s+(+x.payout||0),0), gross = b.reduce((s,x)=>s+(+x.gross||0),0), exp = e.reduce((s,x)=>s+(+x.amount||0),0), nights = b.reduce((s,x)=>s+(+x.nights||0),0);
  const capex = e.filter(x=>['Travaux','Équipement'].includes(x.category||x.cat)).reduce((s,x)=>s+(+x.amount||0),0);
  const demo = DB.bookings.some(x=>x.demo) || DB.expenses.some(x=>x.demo);
  $('#fKpis').innerHTML = (demo?`<div class="banner" style="grid-column:1/-1">Ces chiffres sont des <b>données d'exemple fictives</b> pour visualiser le tableau de bord. Importez le CSV Airbnb et saisissez les dépenses réelles (bouton « Données à fournir »).</div>`:'') + [
    ['Revenus versés', eur(rev), `brut voyageurs ${eur(gross)}`], ['Dépenses', eur(exp), `dont investissements ${eur(capex)}`], ['Résultat', eur(rev-exp), `<span class="${rev-exp>=0?'up':'down'}">${rev?Math.round((rev-exp)/rev*100):0} % de marge</span>`],
    ['Nuits louées', nights, `${b.length} séjours · ${b.length?num(nights/b.length,1):'–'} nuits en moyenne`], ['Revenu moyen / nuit', eur(nights?rev/nights:0), 'net de frais Airbnb'],
    ['Résultat hors investissements', eur(rev-exp+capex), 'exploitation courante']
  ].map(([s,v,t]) => `<div class="kpi"><small>${s}</small><b>${v}</b><span>${t}</span></div>`).join('');
  const months = y==='all' ? [...new Set([...b.map(x=>x.checkin.slice(0,7)), ...e.map(x=>x.date.slice(0,7))])].sort() : Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`);
  const lab = m => y==='all' ? MONTHS[+m.slice(5)-1]+' '+m.slice(2,4) : MONTHS[+m.slice(5)-1];
  let cum = 0; const cumul = months.map(m => cum += b.filter(x=>x.checkin.startsWith(m)).reduce((s,x)=>s+(+x.payout||0),0) - e.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0));
  mk('cFin',{data:{labels:months.map(lab),datasets:[
    {type:'bar',label:'Rentrées',data:months.map(m=>b.filter(x=>x.checkin.startsWith(m)).reduce((s,x)=>s+(+x.payout||0),0)),backgroundColor:COL.forest,borderRadius:4},
    {type:'bar',label:'Sorties',data:months.map(m=>-e.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0)),backgroundColor:COL.ochre,borderRadius:4},
    {type:'line',label:'Résultat cumulé',data:cumul,borderColor:COL.wheat,backgroundColor:COL.wheat,tension:.3,pointRadius:2,yAxisID:'y'}]},
    options:{scales:{x:{stacked:true,grid:{display:false}},y:{stacked:false,ticks:{callback:v=>Math.round(v/100)/10+' k€'}}},plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+' : '+eur(Math.abs(c.raw))}}}}});
  const byCat = {}; e.forEach(x => byCat[x.category||x.cat] = (byCat[x.category||x.cat]||0) + (+x.amount||0));
  const cats = Object.entries(byCat).sort((a,b)=>b[1]-a[1]); const pal = ['#2f4a34','#c4552c','#3c6e7c','#d8b46a','#76863f','#7a4f8a','#5b93a0','#e07a4c','#8a8473','#b8813a','#3f6145'];
  mk('cExp',{type:'doughnut',data:{labels:cats.map(c=>c[0]),datasets:[{data:cats.map(c=>c[1]),backgroundColor:pal,borderColor:'#fffaf0',borderWidth:2}]},
    options:{cutout:'62%',plugins:{legend:{position:'right'},tooltip:{callbacks:{label:c=>`${c.label} : ${eur(c.raw)} (${Math.round(c.raw/exp*100)} %)`}}}}});
  $('#tBook').innerHTML = `<thead><tr><th>Arrivée</th><th>Voyageur</th><th class="num">Nuits</th><th class="num">Versé</th><th>Statut</th><th></th></tr></thead><tbody>${
    [...b].sort((p,q)=>q.checkin.localeCompare(p.checkin)).map(x => `<tr><td>${new Date(x.checkin).toLocaleDateString('fr-BE')}</td><td>${esc(x.guest||'')}${x.demo?' <span class="demo">exemple</span>':''}</td><td class="num">${x.nights}</td><td class="num">${eur(+x.payout,2)}</td><td><small>${esc(x.status||'')}</small></td>
    <td><button class="mini" data-eb="${DB.key(x)}" title="Modifier">✎</button><button class="mini" data-db="${DB.key(x)}" title="Supprimer">✕</button></td></tr>`).join('')}</tbody>`;
  $('#tExp').innerHTML = `<thead><tr><th>Date</th><th>Catégorie</th><th>Libellé</th><th class="num">Montant</th><th></th></tr></thead><tbody>${
    [...e].sort((p,q)=>q.date.localeCompare(p.date)).map(x => `<tr><td>${new Date(x.date).toLocaleDateString('fr-BE')}</td><td><small>${esc(x.category||x.cat)}</small></td><td>${esc(x.label)}${x.demo?' <span class="demo">exemple</span>':''}</td><td class="num">${eur(+x.amount,2)}</td>
    <td><button class="mini" data-ee="${DB.key(x)}" title="Modifier">✎</button><button class="mini" data-de="${DB.key(x)}" title="Supprimer">✕</button></td></tr>`).join('')}</tbody>`;
}
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-eb],[data-db],[data-ee],[data-de]'); if(!t) return;
  if(t.dataset.eb) editBooking(DB.bookings.find(x=>String(DB.key(x))===t.dataset.eb));
  if(t.dataset.ee) editExpense(DB.expenses.find(x=>String(DB.key(x))===t.dataset.ee));
  if(t.dataset.db && confirm('Supprimer cette réservation ?')){ await DB.delRow('b', isNaN(t.dataset.db)?t.dataset.db:t.dataset.db); drawFin(); }
  if(t.dataset.de && confirm('Supprimer cette dépense ?')){ await DB.delRow('e', t.dataset.de); drawFin(); }
});
function form(fields, row){ return fields.map(([k,l,type,opt]) => `<label>${l}${type==='select'?`<select class="field" name="${k}">${opt.map(o=>`<option ${row[k]===o?'selected':''}>${o}</option>`).join('')}</select>`
  : type==='check' ? ` <input type="checkbox" name="${k}" ${row[k]?'checked':''}>` : `<input class="field" name="${k}" type="${type}" step="any" value="${esc(row[k]??'')}">`}</label>`).join(''); }
function editBooking(row){
  row = row || {checkin:new Date().toISOString().slice(0,10), nights:2, guests:4, gross:0, cleaning:60, fee:0, payout:0, touristTax:0, status:'à venir', source:'Airbnb'};
  openDrawer(`<h3>${row.checkin&&DB.key(row)?'Modifier':'Nouvelle'} réservation</h3>`, `<form id="fb">${form([['checkin','Arrivée','date'],['nights','Nuits','number'],['guest','Voyageur','text'],['guests','Nombre de voyageurs','number'],['gross','Montant brut payé (€)','number'],['cleaning','dont ménage (€)','number'],['fee','Frais de service hôte (€)','number'],['payout','Versé (€)','number'],['touristTax','Taxe de séjour (€)','number'],['ext_ref','Code de confirmation','text'],['status','Statut','select',['à venir','terminée','annulée']],['source','Source','select',['Airbnb','Direct','Booking','Autre']],['notes','Notes','text']], row)}
    <div class="actions"><button class="btn btn-primary">Enregistrer</button></div><p class="muted small">Astuce : si « Versé » reste à 0, il est calculé (brut − frais).</p></form>`);
  $('#fb').onsubmit = async ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target));
    const r = {...row, ...f}; ['nights','guests','gross','cleaning','fee','payout','touristTax'].forEach(k => r[k] = +r[k]||0); if(!r.payout) r.payout = +(r.gross - r.fee).toFixed(2); r.demo = false;
    try{ await DB.saveRow('b', r); closeDrawer(); drawFin(); toast('Réservation enregistrée'); }catch(err){ toast('Erreur : '+err.message); } };
}
function editExpense(row){
  row = row || {date:new Date().toISOString().slice(0,10), category:'Entretien', label:'', amount:0, recurring:false};
  if(row.cat && !row.category) row.category = row.cat;
  openDrawer(`<h3>${DB.key(row)?'Modifier':'Nouvelle'} dépense</h3>`, `<form id="fe">${form([['date','Date','date'],['category','Catégorie','select',ECATS],['label','Libellé','text'],['amount','Montant TTC (€)','number'],['supplier','Fournisseur','text'],['recurring','Dépense récurrente','check'],['notes','Notes','text']], row)}
    <div class="actions"><button class="btn btn-primary">Enregistrer</button></div></form>`);
  $('#fe').onsubmit = async ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target));
    const r = {...row, ...f, amount:+f.amount||0, recurring: !!f.recurring, demo:false}; delete r.cat;
    try{ await DB.saveRow('e', r); closeDrawer(); drawFin(); toast('Dépense enregistrée'); }catch(err){ toast('Erreur : '+err.message); } };
}
// Import du CSV « Historique des transactions » d'Airbnb (FR ou EN)
function parseCsv(t){ const rows = []; let row = [], cur = '', q = false;
  for(let i=0;i<t.length;i++){ const c = t[i]; if(q){ if(c==='"'){ if(t[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=c; }
    else if(c==='"') q=true; else if(c===','||c===';'){ row.push(cur); cur=''; } else if(c==='\n'){ row.push(cur); rows.push(row); row=[]; cur=''; } else if(c!=='\r') cur+=c; }
  if(cur||row.length){ row.push(cur); rows.push(row); } return rows.filter(r=>r.some(x=>x.trim())); }
async function importCsv(ev){
  const file = ev.target.files[0]; if(!file) return; const rows = parseCsv(await file.text()); ev.target.value = '';
  const H = rows[0].map(h => h.trim().toLowerCase());
  const col = (...names) => H.findIndex(h => names.some(n => h===n || h.includes(n)));
  const c = {type:col('type'), code:col('code de confirmation','confirmation code'), start:col('date de début','start date','date d\'arrivée'), nights:col('nuits','nights'),
    guest:col('voyageur','guest'), amount:col('montant','amount'), fee:col('frais de service','service fee'), clean:col('frais de ménage','cleaning fee'), gross:col('revenus bruts','gross earnings'), tax:col('taxes de séjour','occupancy tax')};
  if(c.start<0 || c.amount<0) return toast('Format non reconnu : exportez « Historique des transactions » depuis Airbnb › Revenus.');
  const n = s => +String(s||'').replace(/[^\d,.-]/g,'').replace(',','.') || 0;
  const d = s => { s = (s||'').trim(); let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if(m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[0] : null; };
  const out = rows.slice(1).filter(r => c.type<0 || /r[ée]servation/i.test(r[c.type])).map(r => ({ext_ref:r[c.code]||null, id: undefined, checkin:d(r[c.start]), nights:+r[c.nights]||1, guest:r[c.guest]||'',
    payout:n(r[c.amount]), fee:c.fee>=0?n(r[c.fee]):0, cleaning:c.clean>=0?n(r[c.clean]):0, gross:c.gross>=0?n(r[c.gross]):n(r[c.amount]), touristTax:c.tax>=0?n(r[c.tax]):0, guests:null,
    status: new Date(d(r[c.start])) > new Date() ? 'à venir' : 'terminée', source:'Airbnb', demo:false})).filter(r => r.checkin);
  if(!out.length) return toast('Aucune réservation trouvée dans ce fichier');
  if(DB.bookings.some(b=>b.demo) && confirm(`${out.length} réservations trouvées. Supprimer d'abord les réservations d'exemple ?`)){
    if(DB.mode==='live') await DB.sb.from('bookings').delete().eq('demo', true); DB.bookings = DB.bookings.filter(b=>!b.demo); }
  out.forEach(o => { delete o.id; if(DB.mode==='demo'){ const ex = DB.bookings.find(b => b.ext_ref && b.ext_ref===o.ext_ref); if(ex) Object.assign(ex, o); else DB.bookings.push({...o, uid:'b'+Math.random().toString(36).slice(2)}); } });
  if(DB.mode==='live') await DB.bulkBookings(out); else DB.persist();
  drawFin(); toast(`${out.length} réservations importées`);
}
function exportFin(){
  const y = $('#fYear').value; const inY = d => y==='all' || d.startsWith(y);
  const lines = [['Type','Date','Catégorie / Voyageur','Libellé','Nuits','Montant (€)'].join(';')];
  DB.bookings.filter(b=>inY(b.checkin)).forEach(b => lines.push(['Rentrée',b.checkin,b.guest,`Séjour ${b.ext_ref||''}`,b.nights,String(b.payout).replace('.',',')].join(';')));
  DB.expenses.filter(e=>inY(e.date)).forEach(e => lines.push(['Sortie',e.date,e.category||e.cat,e.label,'',String(-e.amount).replace('.',',')].join(';')));
  download(`belizel-comptabilite-${y}.csv`, '﻿'+lines.join('\n'), 'text/csv');
}
function needs(){
  openDrawer('<h3>Données à demander au propriétaire</h3>', `<p>Pour remplacer les données d'exemple par un suivi réel :</p>
  <h4>Rentrées</h4><ul class="needs"><li><b>Export CSV Airbnb</b> : Airbnb › Menu › Revenus › « Historique des transactions » › Exporter en CSV (toutes les années depuis l'ouverture). Il s'importe en un clic.</li><li>Les réservations hors Airbnb (amis, réservations directes), s'il y en a.</li><li>Le montant de la taxe de séjour communale de Chiny (par nuit et par personne) et la manière dont elle est perçue.</li></ul>
  <h4>Sorties récurrentes</h4><ul class="needs"><li>Énergie : électricité, mazout ou gaz, bois (factures ou acomptes mensuels).</li><li>Eau, internet, assurance habitation (avec la mention location de vacances).</li><li>Précompte immobilier, taxe sur les secondes résidences ou les hébergements touristiques éventuelle.</li><li>Ménage et linge : coût par séjour (prestataire ou forfait).</li><li>Entretien : jardin, ramonage, chaudière, petites réparations.</li><li>Honoraires du comptable.</li></ul>
  <h4>Investissements</h4><ul class="needs"><li>Achat et frais d'acte (si l'on veut calculer le rendement), travaux de rénovation avec date et montant, mobilier et équipement.</li></ul>
  <h4>Mode d'emploi et accueil</h4><ul class="needs"><li>Wifi (réseau et mot de passe), boîte à clés et code, heures d'arrivée et de départ.</li><li>Fonctionnement du poêle, du chauffage et des appareils, tri des déchets et jour de collecte.</li><li>Contacts d'urgence, commerces et adresses préférées du propriétaire.</li></ul>
  <h4>Histoires de la maison</h4><ul class="needs"><li>Souvenirs de famille, anecdotes, photos anciennes, histoire de la maison (année de construction, rénovations, 1914 ?).</li></ul>
  <button class="btn btn-soft" onclick="navigator.clipboard.writeText(document.querySelector('#dBody').innerText).then(()=>toast('Liste copiée'))">Copier la liste</button>`);
}

/* ================= Contenus ================= */
function renderContent(){
  const M = DB.manual;
  $('#gCode').value = DB.guestCode; $('#wSsid').value = M.wifi.ssid; $('#wPass').value = M.wifi.password;
  const link = () => { $('#gLink').value = guestLink(); try{ const q = qrcode(0,'M'); q.addData(guestLink()); q.make(); $('#qrLink').innerHTML = q.createSvgTag({cellSize:2,margin:0}); }catch(e){} };
  link(); $('#gCode').oninput = () => { DB.guestCode = $('#gCode').value.trim().toUpperCase(); link(); dirty(); };
  $('#wSsid').oninput = () => { M.wifi.ssid = $('#wSsid').value; dirty(); }; $('#wPass').oninput = () => { M.wifi.password = $('#wPass').value; dirty(); };
  $('#cpLink').onclick = () => navigator.clipboard.writeText($('#gLink').value).then(()=>toast('Lien copié'));
  drawManEd(); drawStories();
  $('#addStory').onclick = () => { DB.stories.push({year:'', title:'Nouvelle histoire', text:'', photo:'img/p01.jpg'}); drawStories(); dirty(); };
  $('#saveContent').onclick = async () => { try{ await DB.saveContent(); $('#saveState').textContent = 'Enregistré ✓'; toast(DB.mode==='live'?'Contenus publiés : le guide est à jour':'Enregistré dans ce navigateur (mode démo)'); }catch(e){ toast('Erreur : '+e.message); } };
  $('#exportContent').onclick = () => { download('manual.js', `// Mode d'emploi exporté depuis l'admin le ${new Date().toLocaleDateString('fr-BE')}\nwindow.MANUAL = ${JSON.stringify(DB.manual, null, 2)};\n`, 'text/javascript');
    download('stories.js', `window.STORIES = ${JSON.stringify(DB.stories, null, 2)};\n`, 'text/javascript'); };
}
function dirty(){ $('#saveState').textContent = 'Modifications non enregistrées'; }
function drawManEd(){
  const M = DB.manual;
  $('#manEd').innerHTML = (M.demo?'<div class="banner">Contenu d\'exemple : relisez chaque réponse avec le propriétaire avant d\'activer le code invité.</div>':'') + M.sections.map((s,si) => `<div class="edsec"><h4>${icon(s.icon)} <input class="field" data-st="${si}" value="${esc(s.title)}" style="flex:1;border-radius:10px"></h4>
    ${s.items.map((it,ii) => `<div class="edrow ${/\[/.test(it.a)?'todo-row':''}"><input class="field" data-q="${si}.${ii}" value="${esc(it.q)}"><textarea class="field" data-a="${si}.${ii}">${esc(it.a)}</textarea><button class="mini" data-rm="${si}.${ii}" title="Supprimer" style="border:0;background:none">✕</button></div>`).join('')}
    <button class="btn btn-soft btn-sm" data-addq="${si}">+ Question</button></div>`).join('');
}
$('#manEd') && document.addEventListener('input', e => { const t = e.target; const M = DB.manual; if(!M) return;
  if(t.dataset.st!=null){ M.sections[+t.dataset.st].title = t.value; dirty(); }
  if(t.dataset.q){ const [a,b] = t.dataset.q.split('.').map(Number); M.sections[a].items[b].q = t.value; dirty(); }
  if(t.dataset.a){ const [a,b] = t.dataset.a.split('.').map(Number); M.sections[a].items[b].a = t.value; t.closest('.edrow').classList.toggle('todo-row', /\[/.test(t.value)); dirty(); }
  if(t.dataset.sf){ const [i,k] = t.dataset.sf.split('.'); DB.stories[+i][k] = t.value; if(k==='text' || k==='title') DB.stories[+i].demo = false; dirty(); } });
document.addEventListener('click', e => { const M = DB.manual; const t = e.target.closest('[data-rm],[data-addq],[data-rs]'); if(!t || !M) return;
  if(t.dataset.rm){ const [a,b] = t.dataset.rm.split('.').map(Number); M.sections[a].items.splice(b,1); drawManEd(); dirty(); }
  if(t.dataset.addq){ M.sections[+t.dataset.addq].items.push({q:'Nouvelle question', a:'[Réponse]'}); drawManEd(); dirty(); }
  if(t.dataset.rs){ DB.stories.splice(+t.dataset.rs,1); drawStories(); dirty(); } });
function drawStories(){
  $('#storyEd').innerHTML = DB.stories.map((s,i) => `<div class="edsec">${s.demo?'<span class="demo" style="font-size:.7rem;background:#fff3cd;padding:2px 6px;border-radius:6px;font-weight:800">EXEMPLE</span>':''}
    <div class="edrow" style="grid-template-columns:110px 1fr 30px"><input class="field" data-sf="${i}.year" value="${esc(s.year)}" placeholder="Année"><input class="field" data-sf="${i}.title" value="${esc(s.title)}"><button class="mini" data-rs="${i}" style="border:0;background:none">✕</button></div>
    <textarea class="field area" data-sf="${i}.text" rows="3">${esc(s.text)}</textarea><input class="field" data-sf="${i}.photo" value="${esc(s.photo||'')}" placeholder="Photo (ex. img/p04.jpg)" style="border-radius:10px;width:100%"></div>`).join('');
}

/* ================= Visite guidée admin ================= */
function startTour(){
  go('synthese');
  Tour([
    {title:'Bienvenue dans l\'espace propriétaire', text:'En une minute, voici comment piloter Belizel : marché, prix, avis, finances et contenu du guide des voyageurs.'},
    {el:'#kpis', title:'Les indicateurs clés', text:'Prix face au marché, note, revenus, résultat et taux d\'occupation de l\'année.'},
    {el:'#reco', title:'Le plan d\'action', text:'Les recommandations sont calculées à partir de l\'analyse de plus de 80 annonces du secteur et classées par impact.'},
    {el:'#tabs a[data-tab="marche"]', title:'Marché & prix', text:'Comparez Belizel aux maisons voisines selon la saison, la capacité et la distance : nuage de points, carte et tableau triable.', block:'nearest'},
    {el:'#tabs a[data-tab="calendrier"]', title:'Tarifs & saisons', text:'Calendrier tarifaire suggéré mois par mois, en tenant compte des festivals, plus un simulateur de revenus.', block:'nearest'},
    {el:'#tabs a[data-tab="finances"]', title:'Finances', text:'Importez le CSV d\'Airbnb, ajoutez les dépenses (travaux, énergie, taxes…) et suivez la rentabilité. Export comptable inclus.', block:'nearest'},
    {el:'#tabs a[data-tab="contenus"]', title:'Contenus du guide', text:'Modifiez le mode d\'emploi, le wifi, le code invité et les histoires de famille : le guide des voyageurs se met à jour.', block:'nearest'},
    {el:'#modeBadge', title:'Mode de données', text:'En démonstration, les données sont fictives et restent dans ce navigateur. Une fois Supabase connecté, tout est partagé et sécurisé.', block:'nearest'}
  ], 'adm.toured').start();
}
$('#aTour').onclick = startTour;

PWA('Belizel Admin');
boot();
})();
