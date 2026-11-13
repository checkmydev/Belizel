/* Belizel — page locataire */
(function(){
const L = window.LISTING, C = window.CONTENT, H = (window.HIKES||[]), M = window.MANUAL, S = window.STORIES||[];
const HOUSE = [L.lat, L.lng];
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const fmtKm = k => k < 1 ? Math.round(k*1000)+' m' : (Math.round(k*10)/10).toString().replace('.',',')+' km';
const fmtDur = m => m < 60 ? m+' min' : Math.floor(m/60)+' h'+(m%60? String(m%60).padStart(2,'0'):'');
const MONTHS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MONTHS_L = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const hydrate = (root=document) => $$('[data-i]', root).forEach(el => { el.outerHTML = icon(el.dataset.i); });

/* ---------- Catalogues (favoris, carte, planning) ---------- */
const PCAT = {
  'patrimoine':{label:'Patrimoine',color:'#7a4f8a',emoji:'🏰'}, 'nature':{label:'Nature',color:'#4f7a3a',emoji:'🌲'},
  'panorama':{label:'Panoramas',color:'#2f4a34',emoji:'⛰️'}, 'baignade-kayak':{label:'Eau & kayak',color:'#3c6e7c',emoji:'🛶'},
  'enfants':{label:'En famille',color:'#e07a4c',emoji:'🧒'}, 'gastronomie':{label:'Gourmand',color:'#c4552c',emoji:'🍽️'},
  'shopping-terroir':{label:'Terroir',color:'#c99a2e',emoji:'🧀'}
};
const ECAT = {festival:'🎪',marché:'🧺',sport:'🏃',culture:'🎭',gastronomie:'🍷',nature:'🌿',enfants:'🎈'};
const items = {}; // id -> {id,type,name,lat,lng,emoji,color}
H.forEach(h => items['h:'+h.id] = {id:'h:'+h.id,type:'Balade',name:h.name,lat:h.start[0],lng:h.start[1],emoji:h.kind==='velo'?'🚲':'🥾',color:h.color,minutes:h.minutes});
C.places.forEach(p => items['p:'+slug(p.name)] = {id:'p:'+slug(p.name),type:'Activité',name:p.name,lat:p.lat,lng:p.lng,emoji:(PCAT[p.category]||{}).emoji||'📍',color:(PCAT[p.category]||{}).color});
C.restaurants.forEach(r => items['r:'+slug(r.name)] = {id:'r:'+slug(r.name),type:'Restaurant',name:r.name,lat:r.lat,lng:r.lng,emoji:'🍴',color:'#c4552c'});
C.producers.forEach(r => items['d:'+slug(r.name)] = {id:'d:'+slug(r.name),type:'Producteur',name:r.name,lat:r.lat,lng:r.lng,emoji:'🧺',color:'#c99a2e'});
C.events.forEach(e => items['e:'+slug(e.name)] = {id:'e:'+slug(e.name),type:'Événement',name:e.name,lat:e.lat,lng:e.lng,emoji:ECAT[e.category]||'📅',color:'#2f4a34'});
C.history.sites.forEach(s => s.lat && (items['s:'+slug(s.name)] = {id:'s:'+slug(s.name),type:'Patrimoine',name:s.name,lat:s.lat,lng:s.lng,emoji:'🏛️',color:'#7a4f8a'}));

let favs = store.get('favs', []);
function isFav(id){ return favs.includes(id); }
function toggleFav(id, btn){
  if(isFav(id)) favs = favs.filter(f => f!==id); else { favs.push(id); toast('Ajouté à « Mon séjour » ♥'); }
  store.set('favs', favs); $$(`.fav[data-fav="${CSS.escape(id)}"]`).forEach(b => b.classList.toggle('on', isFav(id)));
  updateFavCount(); renderPlanner();
}
function favBtn(id){ return `<button class="fav ${isFav(id)?'on':''}" data-fav="${esc(id)}" title="Ajouter à mon séjour">${icon('heart')}</button>`; }
document.addEventListener('click', e => { const b = e.target.closest('.fav'); if(b){ e.stopPropagation(); e.preventDefault(); toggleFav(b.dataset.fav, b); } });
function updateFavCount(){ const c = $('#favCount'); c.textContent = favs.length; c.hidden = !favs.length; }

/* ---------- Navigation ---------- */
$('#logo').innerHTML = LOGO; $('#logo2').innerHTML = LOGO; hydrate();
$('#bookBtn').href = L.airbnbUrl;
const nav = $('#topnav');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > innerHeight*0.6), {passive:true});
const secIO = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ const id = e.target.id;
  $$('#mainnav a, #bottomnav a').forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+id)); } }), {rootMargin:'-45% 0px -50% 0px'});
$$('main section[id]').forEach(s => secIO.observe(s));
$('#btnPlan').onclick = () => location.hash = '#sejour';
$('#moreBtn').onclick = e => { e.preventDefault(); $('#moreSheet').classList.add('on'); };
$('#moreLinks').innerHTML = [['#activites','sparkle','Activités'],['#terroir','chef','Terroir'],['#histoire','scroll','Histoire'],['#culture','book','Culture'],['#sejour','heart','Mon séjour'],['#infos','key',"Mode d'emploi"],['#photos','sun','Photos'],['#help','help','Visite guidée']]
  .map(([h,i,t]) => `<a class="btn btn-soft" href="${h}" style="justify-content:flex-start">${icon(i)}${t}</a>`).join('');
$('#moreSheet').onclick = e => { if(e.target.id==='moreSheet' || e.target.closest('a')){ $('#moreSheet').classList.remove('on'); if(e.target.closest('a[href="#help"]')){ e.preventDefault(); startTour(); } } };

/* ---------- Hero ---------- */
const heroImgs = ['img/p01.jpg','img/p20.jpg','img/p04.jpg','img/p23.jpg','img/p02.jpg','img/p26.jpg'];
$('#slides').innerHTML = heroImgs.map((s,i) => `<div class="slide ${i===0?'on':''}" style="background-image:url(${s})"></div>`).join('');
let si = 0; setInterval(() => { const sl = $$('.slide'); sl[si].classList.remove('on'); si = (si+1)%sl.length; sl[si].classList.add('on'); }, 6000);
$('#heroFacts').innerHTML = [`${L.guests} voyageurs`,`${L.bedrooms} chambres`,`${L.baths} salles de bain`,`★ ${String(L.rating).replace('.',',')} · ${L.reviews} avis`,'Poêle à bois','Jardin']
  .map(t => `<span class="chip">${t}</span>`).join('');

/* ---------- Météo (Open-Meteo, sans clé) ---------- */
const WMO = c => c===0?['☀️','Ensoleillé']:c<=2?['🌤️','Éclaircies']:c===3?['☁️','Couvert']:c<=48?['🌫️','Brouillard']:c<=57?['🌦️','Bruine']:c<=67?['🌧️','Pluie']:c<=77?['❄️','Neige']:c<=82?['🌧️','Averses']:c<=86?['🌨️','Averses de neige']:['⛈️','Orage'];
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${L.lat}&longitude=${L.lng}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=Europe%2FBrussels&forecast_days=6`)
  .then(r => r.json()).then(w => {
    const [e,t] = WMO(w.current.weather_code);
    $('#wxNow').textContent = Math.round(w.current.temperature_2m)+'°'; $('#wxNowTxt').innerHTML = `${e} ${t}<br><small>vent ${Math.round(w.current.wind_speed_10m)} km/h</small>`;
    $('#heroWx').innerHTML = `<span class="chip">${e} ${Math.round(w.current.temperature_2m)}° à Izel</span>`;
    const hm = s => s.slice(11,16).replace(':','h');
    $('#sunTimes').innerHTML = `🌅 ${hm(w.daily.sunrise[0])} · 🌇 ${hm(w.daily.sunset[0])}`;
    $('#forecast').innerHTML = w.daily.time.map((d,i) => { const [ee] = WMO(w.daily.weather_code[i]); const dd = new Date(d+'T12:00');
      return `<div class="d ${i===0?'sel':''}"><b>${i===0?"Auj.":dd.toLocaleDateString('fr-BE',{weekday:'short'})}</b><div class="e">${ee}</div><small>${Math.round(w.daily.temperature_2m_max[i])}°</small> <small class="muted">${Math.round(w.daily.temperature_2m_min[i])}°</small></div>`; }).join('');
    suggest(w.daily.weather_code[0], w.daily.precipitation_probability_max[0], w.daily.temperature_2m_max[0]);
  }).catch(() => { $('#forecast').innerHTML = '<span class="muted">Météo indisponible hors connexion.</span>'; suggest(1, 0, 15); });
function suggest(code, rain, tmax){
  const wet = code >= 51 || rain >= 60;
  let pick, why;
  if(wet){ const r = C.places.filter(p => p.rainy); pick = r[new Date().getDate() % r.length]; why = 'Journée humide : une idée à l\'abri'; }
  else if(tmax >= 24){ pick = C.places.find(p => p.category==='baignade-kayak') || C.places[0]; why = 'Il fait chaud : direction la Semois'; }
  else { const h = H.filter(h => h.kind==='pied' && h.km <= 9).sort((a,b) => a.nearest-b.nearest)[new Date().getDate()%5] || H[0];
    if(h){ $('#suggest').innerHTML = `<div class="ico">${icon('compass')}</div><div><b class="muted" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.08em">Idéal pour marcher</b><h4 style="margin:2px 0">${esc(h.name)}</h4><span class="muted">${fmtKm(h.km)} · ${fmtDur(h.minutes)} · départ à ${fmtKm(h.fromHouse)}</span><br><a href="#balades" data-hike="${h.id}">Voir la balade →</a></div>`; return; } }
  $('#suggest').innerHTML = `<div class="ico">${icon(wet?'rain':'sun')}</div><div><b class="muted" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.08em">${why}</b><h4 style="margin:2px 0">${esc(pick.name)}</h4><span class="muted">${esc(pick.duration||'')} · ${driveMin(haversine(HOUSE,[pick.lat,pick.lng]))} min en voiture</span><br><a href="#activites">Voir les activités →</a></div>`;
}
document.addEventListener('click', e => { const a = e.target.closest('[data-hike]'); if(a){ e.preventDefault(); openHike(+a.dataset.hike); } });

/* ---------- Maison ---------- */
$('#introTxt').textContent = L.intro;
$('#highlights').innerHTML = L.highlights.map(h => `<div class="card hl reveal"><div class="ico">${icon(h.icon)}</div><div><h4>${h.title}</h4><p>${h.text}</p></div></div>`).join('');
const tags = ['Tout', ...new Set(L.gallery.map(g => g.tag))]; let gTag = 'Tout', gList = [];
function renderGallery(){
  $('#galFilters').innerHTML = tags.map(t => `<button class="fchip ${t===gTag?'on':''}" data-t="${t}">${t}</button>`).join('');
  gList = L.gallery.filter(g => gTag==='Tout' || g.tag===gTag);
  $('#gallery').innerHTML = gList.map((g,i) => `<figure data-i="${i}"><img src="${g.src}" alt="${esc(g.cap)}" loading="lazy"><figcaption>${esc(g.cap)}</figcaption></figure>`).join('');
}
$('#galFilters').onclick = e => { const b = e.target.closest('button'); if(b){ gTag = b.dataset.t; renderGallery(); } };
let lbI = 0; const lb = $('#lightbox');
const lbShow = i => { lbI = (i+gList.length)%gList.length; lb.querySelector('img').src = gList[lbI].src; lb.querySelector('.cap').textContent = gList[lbI].cap; };
$('#gallery').onclick = e => { const f = e.target.closest('figure'); if(f){ lbShow(+f.dataset.i); lb.classList.add('on'); } };
lb.querySelector('.prev').onclick = () => lbShow(lbI-1); lb.querySelector('.next').onclick = () => lbShow(lbI+1);
lb.querySelector('.close').onclick = () => lb.classList.remove('on');
lb.onclick = e => { if(e.target===lb) lb.classList.remove('on'); };
addEventListener('keydown', e => { if(!lb.classList.contains('on')) return; if(e.key==='ArrowLeft') lbShow(lbI-1); if(e.key==='ArrowRight') lbShow(lbI+1); if(e.key==='Escape') lb.classList.remove('on'); });
let tx0 = null; lb.addEventListener('touchstart', e => tx0 = e.touches[0].clientX, {passive:true});
lb.addEventListener('touchend', e => { if(tx0==null) return; const dx = e.changedTouches[0].clientX - tx0; if(Math.abs(dx) > 40) lbShow(lbI + (dx<0?1:-1)); tx0 = null; });
renderGallery();
$('#rooms').innerHTML = L.rooms.map(r => `<div class="card room reveal"><img src="${r.photo}" alt="${esc(r.name)}" loading="lazy"><div class="b"><h4>${r.name}</h4><span class="muted" style="font-size:.9rem">${r.beds}</span></div></div>`).join('');
$('#amen').innerHTML = L.amenities.map(a => `<span>${icon('check')}${a}</span>`).join('');
$('#rating').textContent = String(L.rating).replace('.',',');
$('#stars').innerHTML = icon('star').repeat(5).replaceAll('class="icon "','class="icon" style="fill:currentColor"');
$('#revCount').textContent = `${L.reviews} avis vérifiés sur Airbnb`;
const CATN = {cleanliness:'Propreté',accuracy:'Exactitude',checkin:'Arrivée',communication:'Communication',location:'Emplacement',value:'Qualité-prix'};
$('#catBars').innerHTML = Object.entries(L.cats).map(([k,v]) => `<div class="row"><span>${CATN[k]}</span><div class="track"><div class="fill" data-w="${(v-3.5)/1.5*100}"></div></div><b>${v.toFixed(1).replace('.',',')}</b></div>`).join('');
new IntersectionObserver((es,o) => es.forEach(e => { if(e.isIntersecting){ $$('#catBars .fill').forEach(f => f.style.width = f.dataset.w+'%'); o.disconnect(); } })).observe($('#catBars'));
const tmax = Math.max(...Object.values(L.tags));
$('#themes').innerHTML = Object.entries(L.tags).sort((a,b)=>b[1]-a[1]).map(([t,n]) => `<span class="theme" style="font-size:${.85+n/tmax*.55}rem">${t}<b>${n}</b></span>`).join('');

/* ---------- Carte ---------- */
let map, layers = {}, hikeLines = {};
function pinIcon(emoji, color, cls=''){ return L_.divIcon({className:'', html:`<div class="pin ${cls}" style="background:${color||'#3c6e7c'}"><span>${emoji}</span></div>`, iconSize:[34,34], iconAnchor:[17,34], popupAnchor:[0,-30]}); }
const L_ = window.L;
function popupFor(it, extra=''){
  const km = haversine(HOUSE,[it.lat,it.lng]);
  return `<h4>${esc(it.name)}</h4><div class="muted" style="font-size:.8rem;margin-bottom:6px">${it.type} · ${fmtKm(km)} · ${driveMin(km)} min en voiture</div>${extra}
  <div style="display:flex;gap:6px;margin-top:8px"><a class="btn btn-soft btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin=${HOUSE}&destination=${it.lat},${it.lng}">${icon('nav')}Itinéraire</a>
  <button class="btn btn-soft btn-sm fav-pop" data-fav="${esc(it.id)}">${icon('heart')}${isFav(it.id)?'Retirer':'Favori'}</button></div>`;
}
document.addEventListener('click', e => { const b = e.target.closest('.fav-pop'); if(b){ toggleFav(b.dataset.fav); b.innerHTML = icon('heart')+(isFav(b.dataset.fav)?'Retirer':'Favori'); } });
function initMap(){
  const osm = L_.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
  const topo = L_.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap, SRTM · © OpenTopoMap'});
  const sat = L_.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'© Esri'});
  map = L_.map('map',{scrollWheelZoom:false, layers:[topo], zoomControl:true}).setView(HOUSE, 11);
  L_.control.layers({'Relief':topo,'Plan':osm,'Satellite':sat},null,{position:'bottomright'}).addTo(map);
  L_.marker(HOUSE,{icon:L_.divIcon({className:'',html:'<div class="pin pin-house"><span>🏡</span></div>',iconSize:[46,46],iconAnchor:[23,46]}),zIndexOffset:1000})
    .addTo(map).bindPopup(`<h4>Belizel</h4><div class="muted">Votre maison à Izel</div>`);
  const groups = {
    balades:{label:'Balades',color:'#3c6e7c',on:true}, activites:{label:'Activités',color:'#e07a4c',on:true}, tables:{label:'Restaurants',color:'#c4552c',on:false},
    terroir:{label:'Producteurs',color:'#c99a2e',on:false}, patrimoine:{label:'Histoire',color:'#7a4f8a',on:false}, agenda:{label:'Événements',color:'#2f4a34',on:false}
  };
  Object.keys(groups).forEach(k => layers[k] = L_.layerGroup());
  H.forEach(h => {
    const line = L_.polyline(h.coords,{color:h.color,weight:3,opacity:.55}); hikeLines[h.id] = line;
    line.on('mouseover',()=>line.setStyle({weight:6,opacity:1})).on('mouseout',()=>line.setStyle({weight:3,opacity:.55})).on('click',()=>openHike(h.id));
    line.bindTooltip(`${h.name} · ${fmtKm(h.km)}`,{sticky:true});
    layers.balades.addLayer(line);
  });
  C.places.forEach(p => { const it = items['p:'+slug(p.name)]; layers.activites.addLayer(L_.marker([p.lat,p.lng],{icon:pinIcon(it.emoji,it.color)}).bindPopup(popupFor(it,`<p style="margin:0">${esc(p.description)}</p>`))); });
  C.restaurants.forEach(p => { const it = items['r:'+slug(p.name)]; layers.tables.addLayer(L_.marker([p.lat,p.lng],{icon:pinIcon('🍴','#c4552c')}).bindPopup(popupFor(it,`<p style="margin:0">${esc(p.style)} · ${p.price||''}</p>`))); });
  C.producers.forEach(p => { const it = items['d:'+slug(p.name)]; layers.terroir.addLayer(L_.marker([p.lat,p.lng],{icon:pinIcon('🧺','#c99a2e')}).bindPopup(popupFor(it,`<p style="margin:0">${esc(p.text).slice(0,160)}…</p>`))); });
  C.history.sites.filter(s=>s.lat).forEach(p => { const it = items['s:'+slug(p.name)]; layers.patrimoine.addLayer(L_.marker([p.lat,p.lng],{icon:pinIcon('🏛️','#7a4f8a')}).bindPopup(popupFor(it,`<p style="margin:0">${esc(p.text).slice(0,180)}…</p>`))); });
  C.events.filter(e=>e.lat).forEach(p => { const it = items['e:'+slug(p.name)]; layers.agenda.addLayer(L_.marker([p.lat,p.lng],{icon:pinIcon(it.emoji,'#2f4a34')}).bindPopup(popupFor(it,`<p style="margin:0"><b>${esc(p.dates)}</b></p>`))); });
  Object.entries(groups).forEach(([k,g]) => { if(g.on) layers[k].addTo(map); });
  $('#mapLegend').innerHTML = Object.entries(groups).map(([k,g]) => `<button class="fchip ${g.on?'on':''}" data-l="${k}"><span class="dot" style="background:${g.color}"></span>${g.label}</button>`).join('');
  $('#mapLegend').onclick = e => { const b = e.target.closest('button'); if(!b) return; const k = b.dataset.l;
    if(map.hasLayer(layers[k])){ map.removeLayer(layers[k]); b.classList.remove('on'); } else { layers[k].addTo(map); b.classList.add('on'); } };
  map.on('focus click', () => map.scrollWheelZoom.enable());
}
new IntersectionObserver((es,o) => es.forEach(e => { if(e.isIntersecting){ initMap(); o.disconnect(); } }),{rootMargin:'300px'}).observe($('#map'));

/* ---------- Balades ---------- */
let hKind = 'pied', hShown = 9;
$('#hikeKind').innerHTML = `<button class="fchip on" data-k="pied">${icon('compass')}À pied</button><button class="fchip" data-k="velo">${icon('bike')}À vélo</button><button class="fchip" data-k="fav">${icon('heart')}Mes favoris</button>`;
$('#hikeKind').onclick = e => { const b = e.target.closest('button'); if(!b) return; hKind = b.dataset.k; $$('#hikeKind .fchip').forEach(x => x.classList.toggle('on', x===b)); hShown = 9; renderHikes(); };
['hikeDiff','hikeLen','hikeSort'].forEach(id => $('#'+id).onchange = () => { hShown = 9; renderHikes(); });
$('#hikeMore').onclick = () => { hShown += 9; renderHikes(); };
function miniSvg(h){
  const xs = h.coords.map(c=>c[1]), ys = h.coords.map(c=>c[0]); const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const k = Math.cos(y0*Math.PI/180); const w=(x1-x0)*k||1e-4, hh=(y1-y0)||1e-4; const s = Math.min(260/w, 110/hh);
  const ox = (300 - w*s)/2, oy = (150 - hh*s)/2;
  const d = h.coords.map((c,i)=>`${i?'L':'M'}${(ox+(c[1]-x0)*k*s).toFixed(1)},${(oy+(y1-c[0])*s).toFixed(1)}`).join('');
  const st = h.coords[0];
  return `<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet"><defs><pattern id="g${h.id}" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="#d9cfb6" stroke-width=".6"/></pattern></defs>
  <rect width="300" height="150" fill="url(#g${h.id})"/><path d="${d}" fill="none" stroke="${h.color}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" class="draw"/>
  <circle cx="${(ox+(st[1]-x0)*k*s).toFixed(1)}" cy="${(oy+(y1-st[0])*s).toFixed(1)}" r="5" fill="#fff" stroke="${h.color}" stroke-width="2.5"/></svg>`;
}
function filteredHikes(){
  let list = H.filter(h => hKind==='fav' ? isFav('h:'+h.id) : h.kind===hKind);
  const d = $('#hikeDiff').value, len = $('#hikeLen').value;
  if(d) list = list.filter(h => h.diff===d);
  if(len){ const [a,b] = len.split('-').map(Number); list = list.filter(h => h.km>=a && h.km<b); }
  const s = $('#hikeSort').value;
  list.sort(s==='short'?(a,b)=>a.km-b.km : s==='long'?(a,b)=>b.km-a.km : s==='flat'?(a,b)=>(a.up/a.km)-(b.up/b.km) : (a,b)=>a.nearest-b.nearest);
  return list;
}
function renderHikes(){
  const list = filteredHikes();
  $('#hikeCount').textContent = `${list.length} itinéraire${list.length>1?'s':''}`;
  $('#hikes').innerHTML = list.slice(0,hShown).map(h => `<article class="card hike" data-h="${h.id}">
    <div class="mini">${miniSvg(h)}<span class="diff ${h.diff}">${h.diff}</span>${favBtn('h:'+h.id)}</div>
    <div class="b"><h4>${esc(h.name)}</h4><span class="muted" style="font-size:.84rem">${h.ref?`<span class="marker-sym" style="background:${h.color}"></span> ${esc(h.ref)} · `:''}${esc(h.operator||'Itinéraire balisé')}</span>
    <div class="meta"><span>${icon('ruler')}${fmtKm(h.km)}</span><span>${icon('up')}${h.up} m</span><span>${icon('clock')}${fmtDur(h.minutes)}</span><span>${h.nearest<1.2?icon('house')+'à pied depuis la maison':icon('car')+fmtKm(h.nearest)}</span></div></div></article>`).join('')
    || '<p class="muted">Aucune balade ne correspond. Ajoutez des favoris avec ♥ ou élargissez les filtres.</p>';
  $('#hikeMore').style.display = list.length > hShown ? '' : 'none';
}
$('#hikes').onclick = e => { const c = e.target.closest('.hike'); if(c && !e.target.closest('.fav')) openHike(+c.dataset.h); };

let dMap;
function openDrawer(title, html){ $('#dTitle').innerHTML = title; $('#dBody').innerHTML = html; $('#drawer').classList.add('on'); $('#drawerBg').classList.add('on'); document.body.style.overflow='hidden'; }
function closeDrawer(){ $('#drawer').classList.remove('on'); $('#drawerBg').classList.remove('on'); document.body.style.overflow=''; if(dMap){ dMap.remove(); dMap = null; } }
$('#dClose').onclick = closeDrawer; $('#drawerBg').onclick = closeDrawer; addEventListener('keydown', e => { if(e.key==='Escape') closeDrawer(); });

function nearbyAlong(h){
  const pts = h.coords.filter((_,i) => i % 3 === 0);
  const all = [...C.places.map(p=>({n:p.name,lat:p.lat,lng:p.lng,e:(PCAT[p.category]||{}).emoji||'📍'})), ...C.history.sites.filter(s=>s.lat).map(s=>({n:s.name,lat:s.lat,lng:s.lng,e:'🏛️'})), ...C.restaurants.map(r=>({n:r.name,lat:r.lat,lng:r.lng,e:'🍴'}))];
  return all.filter(p => pts.some(c => haversine(c,[p.lat,p.lng]) < .6)).slice(0,6);
}
function openHike(id){
  const h = H.find(x => x.id===id); if(!h) return;
  const near = nearbyAlong(h);
  openDrawer(`<span class="diff ${h.diff}" style="position:static;display:inline-block;margin-bottom:6px">${h.diff}</span><h3>${esc(h.name)}</h3><span class="muted" style="font-size:.88rem">${h.ref?`<span class="marker-sym" style="background:${h.color}"></span> Balisage ${esc(h.ref)} · `:''}${esc(h.operator||'')}</span>`,
  `<div id="hikeMap"></div>
   <div class="stats"><div><b>${fmtKm(h.km)}</b><small>Distance</small></div><div><b>${fmtDur(h.minutes)}</b><small>Durée</small></div><div><b>+${h.up} m</b><small>Dénivelé</small></div><div><b>${h.loop?'Boucle':'Aller'}</b><small>Parcours</small></div></div>
   ${h.ele?`<svg class="profile" id="prof" viewBox="0 0 600 150" preserveAspectRatio="none"></svg><div class="muted" style="font-size:.78rem;margin-top:4px">Survolez le profil pour suivre votre position sur la carte.</div>`:''}
   <div class="actions">
     <button class="btn btn-primary" id="dlGpx">${icon('download')}Télécharger le GPX</button>
     <a class="btn btn-soft" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin=${HOUSE}&destination=${h.start[0]},${h.start[1]}">${icon('nav')}Aller au départ</a>
     ${favBtn('h:'+h.id).replace('class="fav','class="btn btn-soft fav').replace('</button>','Favori</button>')}
     <a class="btn btn-soft" target="_blank" rel="noopener" href="${h.osm}">${icon('map')}OpenStreetMap</a>
   </div>
   <p>${h.nearest<1.2?`<b>Départ à pied depuis la maison</b> : le tracé passe à ${fmtKm(h.nearest)} de Belizel.`:`Le tracé passe à ${fmtKm(h.nearest)} de la maison, soit environ ${driveMin(h.nearest)} min en voiture.`}
   ${h.kind==='pied'?' Suivez le balisage '+(h.ref?`« ${esc(h.ref)} » `:'')+'peint sur les arbres et les poteaux.':' Itinéraire vélo balisé.'}</p>
   ${near.length?`<h4>En chemin</h4><div class="amen">${near.map(p=>`<span>${p.e} ${esc(p.n)}</span>`).join('')}</div>`:''}
   <p class="muted" style="font-size:.8rem;margin-top:16px">Tracé © contributeurs OpenStreetMap (ODbL). Durée estimée à 4,2 km/h, plus 1 h par 450 m de montée. Altitudes EU-DEM 25 m. Prévoyez de bonnes chaussures : les sentiers gaumais sont souvent humides.</p>`);
  hydrate($('#drawer'));
  setTimeout(() => {
    dMap = L_.map('hikeMap',{zoomControl:true,attributionControl:false});
    L_.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17}).addTo(dMap);
    const line = L_.polyline(h.coords,{color:h.color,weight:5}).addTo(dMap);
    dMap.fitBounds(line.getBounds(),{padding:[20,20]});
    L_.circleMarker(h.start,{radius:8,color:'#fff',weight:3,fillColor:'#2f4a34',fillOpacity:1}).addTo(dMap).bindTooltip('Départ');
    L_.marker(HOUSE,{icon:L_.divIcon({className:'',html:'<div class="pin" style="background:#c4552c;width:28px;height:28px"><span style="font-size:13px">🏡</span></div>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(dMap);
    const cursor = L_.circleMarker(h.start,{radius:7,color:'#fff',weight:3,fillColor:'#c4552c',fillOpacity:1});
    if(h.ele) drawProfile(h, cursor);
  }, 420);
  $('#dlGpx').onclick = () => { download(slug(h.name)+'.gpx', gpx(h.name, h.samples.length > h.coords.length ? h.samples : h.coords, h.samples.length > h.coords.length ? h.ele : null, `${h.km} km, +${h.up} m — balisage ${h.ref||''}`), 'application/gpx+xml'); toast('GPX téléchargé : ouvrez-le dans votre app de randonnée'); };
}
function drawProfile(h, cursor){
  const svg = $('#prof'), e = h.ele, n = e.length, mn = Math.min(...e)-10, mx = Math.max(...e)+10;
  const X = i => i/(n-1)*600, Y = v => 140 - (v-mn)/(mx-mn)*125;
  const d = e.map((v,i) => `${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  svg.innerHTML = `<defs><linearGradient id="pg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${h.color}" stop-opacity=".45"/><stop offset="1" stop-color="${h.color}" stop-opacity=".03"/></linearGradient></defs>
    <path d="${d}L600,150L0,150Z" fill="url(#pg)"/><path d="${d}" fill="none" stroke="${h.color}" stroke-width="2.2" vector-effect="non-scaling-stroke"/>
    <text x="6" y="14" font-size="11" fill="#8a8473">${Math.round(Math.max(...e))} m</text><text x="6" y="146" font-size="11" fill="#8a8473">${Math.round(Math.min(...e))} m</text>
    <line id="pl" y1="0" y2="150" stroke="#2b2a25" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0"/>`;
  const pl = $('#pl');
  const move = ev => { const r = svg.getBoundingClientRect(); const cx = ((ev.touches?ev.touches[0].clientX:ev.clientX) - r.left)/r.width; const i = Math.max(0,Math.min(n-1,Math.round(cx*(n-1))));
    pl.setAttribute('x1',X(i)); pl.setAttribute('x2',X(i)); pl.setAttribute('opacity',.6); cursor.setLatLng(h.samples[i]).addTo(dMap)
      .bindTooltip(`${Math.round(e[i])} m · km ${(h.km*i/(n-1)).toFixed(1).replace('.',',')}`,{permanent:true,direction:'top',offset:[0,-8]}).openTooltip(); };
  svg.addEventListener('mousemove', move); svg.addEventListener('touchmove', move, {passive:true});
  svg.addEventListener('mouseleave', () => { pl.setAttribute('opacity',0); cursor.remove(); });
}
renderHikes();
$('#packCount').textContent = `${H.filter(h=>h.kind==='pied').length} itinéraires balisés`;
$('#appBox').onclick = e => { const b = e.target.closest('[data-pack]'); if(!b) return; const k = b.dataset.pack;
  let list = k==='near' ? H.filter(h=>h.kind==='pied').sort((a,b)=>a.nearest-b.nearest).slice(0,15) : k==='fav' ? H.filter(h=>isFav('h:'+h.id)) : H.filter(h=>h.kind===k);
  if(!list.length) return toast(k==='fav' ? 'Ajoutez d\'abord des balades en favori ♥' : 'Aucun itinéraire');
  const tracks = list.map(h => { const hi = h.samples.length > h.coords.length; return {name:`${h.ref?h.ref+' · ':''}${h.name} (${String(h.km).replace('.',',')} km)`, desc:`${h.km} km, +${h.up} m, ${h.diff}`, coords: hi?h.samples:h.coords, ele: hi?h.ele:null}; });
  download(`belizel-balades-${k}.gpx`, gpxMulti(`Belizel · ${b.querySelector('b').textContent}`, tracks), 'application/gpx+xml');
  toast(`${list.length} balade${list.length>1?'s':''} prête${list.length>1?'s':''} : ouvrez le fichier avec Organic Maps`); };

/* ---------- Activités ---------- */
let aCat = '';
$('#actFilters').innerHTML = `<button class="fchip on" data-c="">Tout</button>` + Object.entries(PCAT).map(([k,v]) => `<button class="fchip" data-c="${k}"><span class="dot" style="background:${v.color}"></span>${v.label}</button>`).join('');
$('#actFilters').onclick = e => { const b = e.target.closest('button'); if(!b) return; aCat = b.dataset.c; $$('#actFilters .fchip').forEach(x => x.classList.toggle('on', x===b)); renderActs(); };
$('#rainOnly').onchange = renderActs;
function renderActs(){
  const list = C.places.filter(p => (!aCat || p.category===aCat) && (!$('#rainOnly').checked || p.rainy))
    .map(p => ({...p, km: haversine(HOUSE,[p.lat,p.lng])})).sort((a,b) => a.km-b.km);
  $('#acts').innerHTML = list.map(p => { const c = PCAT[p.category]||{}; const id = 'p:'+slug(p.name);
    return `<article class="card act reveal in" style="position:relative"><div class="top" style="background:${c.color}"></div>${favBtn(id).replace('class="fav','class="fav" style="top:16px')}<div class="b">
    <span class="cat" style="color:${c.color}">${c.emoji} ${c.label}</span><h4 style="padding-right:36px">${esc(p.name)}</h4><p>${esc(p.description)}</p>
    ${p.tip?`<div class="tip">« ${esc(p.tip)} »</div>`:''}
    <div class="meta"><span>${icon('car')} ${driveMin(p.km)} min</span>${p.duration?`<span>${icon('clock')} ${esc(p.duration)}</span>`:''}${p.rainy?'<span class="rainy">☔ par temps de pluie</span>':''}<span class="grow"></span>
    ${p.url?`<a href="${p.url}" target="_blank" rel="noopener">Site ↗</a>`:''}<a href="#explorer" data-fly="${p.lat},${p.lng}">Carte</a></div></div></article>`; }).join('');
}
document.addEventListener('click', e => { const a = e.target.closest('[data-fly]'); if(a){ const [la,ln] = a.dataset.fly.split(',').map(Number); setTimeout(() => { if(!map) initMap(); map.flyTo([la,ln], 14, {duration:1.5}); }, 500); } });
renderActs();

/* ---------- Agenda ---------- */
const now = new Date(); const startM = new Date(now.getFullYear(), now.getMonth(), 1);
const monthList = Array.from({length:13}, (_,i) => new Date(startM.getFullYear(), startM.getMonth()+i, 1));
let selM = null; let stay = store.get('stay', null);
if(stay){ $('#stayIn').value = stay.in; $('#stayOut').value = stay.out; }
function stayMonths(){ if(!stay) return new Set(); const a = new Date(stay.in), b = new Date(stay.out); const s = new Set(); for(let d = new Date(a.getFullYear(),a.getMonth(),1); d <= b; d.setMonth(d.getMonth()+1)) s.add(d.getMonth()+1); return s; }
function evDate(e){ const m = (e.dates||'').match(/(\d{1,2})(?:er)?\s*(?:[-–au ]+\s*\d{1,2}(?:er)?)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(20\d\d)/i);
  if(m) return {day:+m[1], month:MONTHS_L.indexOf(m[2].toLowerCase())+1, year:+m[3]}; return null; }
function renderMonths(){
  const sm = stayMonths();
  $('#months').innerHTML = `<button class="${selM===null?'on':''}" data-m="">Tout<small>${C.events.length} évén.</small></button>` + monthList.map(d => { const m = d.getMonth()+1; const n = C.events.filter(e => e.month===m).length;
    return `<button class="${selM===m?'on':''} ${sm.has(m)?'stay':''}" data-m="${m}">${MONTHS[d.getMonth()]}<small>${d.getFullYear()} · ${n}</small></button>`; }).join('') + `<button class="${selM===0?'on':''}" data-m="0">Chaque semaine<small>marchés</small></button>`;
}
$('#months').onclick = e => { const b = e.target.closest('button'); if(!b) return; selM = b.dataset.m==='' ? null : +b.dataset.m; renderMonths(); renderEvents(); };
function renderEvents(){
  const sm = stayMonths();
  let list = C.events.filter(e => selM===null ? (stay ? (sm.has(e.month) || e.month==null) : true) : selM===0 ? e.month==null : e.month===selM);
  const order = m => m==null ? 99 : ((m - (now.getMonth()+1) + 12) % 12);
  list.sort((a,b) => order(a.month)-order(b.month));
  $('#events').innerHTML = list.map(e => { const dd = evDate(e); const id = 'e:'+slug(e.name);
    return `<article class="card ev" style="position:relative;color:var(--ink)"><div class="date">${e.month?`<small>${MONTHS[e.month-1]}</small><b>${dd?dd.day:'·'}</b>`:'<small>chaque</small><b>📆</b>'}</div>
    <div class="b">${favBtn(id)}<span class="cat" style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--semois)">${ECAT[e.category]||''} ${esc(e.category)}</span><h4 style="padding-right:36px">${esc(e.name)}</h4>
    <p>${esc(e.description)}</p><div class="muted" style="font-size:.84rem"><b>${esc(e.dates)}</b> · ${esc(e.place)}${e.confirmed===false?' · <i>date à confirmer</i>':''}</div>
    <div style="display:flex;gap:10px;margin-top:8px;font-size:.85rem;font-weight:700">${dd?`<a href="#" data-ics="${esc(id)}">+ Mon agenda</a>`:''}${e.url?`<a href="${e.url}" target="_blank" rel="noopener">Site officiel ↗</a>`:''}<a href="#explorer" data-fly="${e.lat},${e.lng}">Carte</a></div></div></article>`; }).join('')
    || '<p>Pas d\'événement répertorié sur cette période : profitez du calme et des balades !</p>';
}
document.addEventListener('click', e => { const a = e.target.closest('[data-ics]'); if(!a) return; e.preventDefault();
  const ev = C.events.find(x => 'e:'+slug(x.name)===a.dataset.ics); const dd = evDate(ev);
  const s = `${dd.year}-${String(dd.month).padStart(2,'0')}-${String(dd.day).padStart(2,'0')}`; const end = new Date(s); end.setDate(end.getDate()+1);
  download(slug(ev.name)+'.ics', ics([{start:s,end:end.toISOString().slice(0,10),title:ev.name,place:ev.place,desc:ev.description+' '+(ev.url||'')}]), 'text/calendar'); });
$('#stayApply').onclick = () => { if(!$('#stayIn').value || !$('#stayOut').value) return toast('Indiquez vos dates d\'arrivée et de départ');
  stay = {in:$('#stayIn').value, out:$('#stayOut').value}; store.set('stay', stay); selM = null; renderMonths(); renderEvents(); renderPlanner(); toast('Agenda filtré sur votre séjour'); };
$('#stayClear').onclick = () => { stay = null; store.set('stay', null); $('#stayIn').value = $('#stayOut').value = ''; selM = null; renderMonths(); renderEvents(); renderPlanner(); };
renderMonths(); renderEvents();

/* ---------- Terroir ---------- */
const FT = [['spec','Spécialités'],['resto','Nos tables'],['prod','Producteurs'],['recette','Recettes']]; let ft = 'spec';
$('#foodTabs').innerHTML = FT.map(([k,t]) => `<button class="fchip ${k===ft?'on':''}" data-k="${k}">${t}</button>`).join('');
$('#foodTabs').onclick = e => { const b = e.target.closest('button'); if(!b) return; ft = b.dataset.k; $$('#foodTabs .fchip').forEach(x => x.classList.toggle('on', x===b)); renderFood(); };
function renderFood(){
  const B = $('#foodBody');
  if(ft==='spec') B.innerHTML = `<div class="grid g3">${C.specialties.map(s => `<article class="card act"><div class="b"><div style="font-size:2.2rem">${s.emoji||'🍽️'}</div><h4>${esc(s.name)}</h4><p>${esc(s.text)}</p>${s.where?`<div class="tip">Où ? ${esc(s.where)}</div>`:''}</div></article>`).join('')}</div>`;
  if(ft==='resto') B.innerHTML = `<div class="grid g3">${C.restaurants.map(r => { const id = 'r:'+slug(r.name), km = haversine(HOUSE,[r.lat,r.lng]);
    return `<article class="card act" style="position:relative">${favBtn(id)}<div class="b"><span class="cat" style="color:var(--ochre)">🍴 ${esc(r.town)} · ${r.price||''}</span><h4 style="padding-right:36px">${esc(r.name)}</h4><p><b>${esc(r.style)}</b></p><p>${esc(r.text)}</p>
    <div class="meta"><span>${icon('car')} ${driveMin(km)} min</span><span class="grow"></span>${r.url?`<a href="${r.url}" target="_blank" rel="noopener">Site ↗</a>`:''}<a href="#explorer" data-fly="${r.lat},${r.lng}">Carte</a></div></div></article>`; }).join('')}</div>
    <p class="muted" style="font-size:.85rem;margin-top:14px">Réservez, surtout le week-end et en été. Horaires à vérifier : beaucoup de tables ferment en début de semaine.</p>`;
  if(ft==='prod') B.innerHTML = `<div class="grid g3">${C.producers.map(r => { const id = 'd:'+slug(r.name), km = haversine(HOUSE,[r.lat,r.lng]);
    return `<article class="card act" style="position:relative">${favBtn(id)}<div class="b"><span class="cat" style="color:var(--wheat)">🧺 ${esc(r.type)} · ${esc(r.town)}</span><h4 style="padding-right:36px">${esc(r.name)}</h4><p>${esc(r.text)}</p>${r.hours?`<div class="muted" style="font-size:.84rem">🕒 ${esc(r.hours)}</div>`:''}
    <div class="meta"><span>${icon('car')} ${driveMin(km)} min</span><span class="grow"></span>${r.url?`<a href="${r.url}" target="_blank" rel="noopener">Site ↗</a>`:''}<a href="#explorer" data-fly="${r.lat},${r.lng}">Carte</a></div></div></article>`; }).join('')}</div>`;
  if(ft==='recette') B.innerHTML = `<div class="grid g2">${C.recipes.map((r,i) => `<article class="card act"><div class="b"><span class="cat" style="color:var(--moss)">👩‍🍳 ${esc(r.serves)} · ${esc(r.time)}</span><h4>${esc(r.name)}</h4>${r.story?`<div class="tip">${esc(r.story)}</div>`:''}
    <details style="margin-top:8px"><summary style="font-weight:800;cursor:pointer">Ingrédients (${r.ingredients.length})</summary><ul style="padding-left:18px">${r.ingredients.map(x=>`<li><label><input type="checkbox"> ${esc(x)}</label></li>`).join('')}</ul></details>
    <div class="meta"><button class="btn btn-forest btn-sm" data-cook="${i}">${icon('chef')}Mode cuisine</button><button class="btn btn-soft btn-sm" data-shop="${i}">${icon('download')}Liste de courses</button></div></div></article>`).join('')}</div>`;
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-cook]'); if(c) cookMode(C.recipes[+c.dataset.cook]);
  const s = e.target.closest('[data-shop]'); if(s){ const r = C.recipes[+s.dataset.shop]; download(slug(r.name)+'-courses.txt', `Liste de courses – ${r.name}\n(${r.serves})\n\n`+r.ingredients.map(x=>'☐ '+x).join('\n'), 'text/plain'); }
});
let wake = null;
function cookMode(r){
  let k = 0;
  const show = () => { $('#dBody').innerHTML = `<div style="display:flex;flex-direction:column;min-height:60vh;justify-content:center;text-align:center;padding:10px">
    <div class="hand" style="font-size:1.6rem;margin:0 auto">Étape ${k+1} / ${r.steps.length}</div>
    <p style="font-family:var(--serif);font-size:clamp(1.3rem,4vw,1.9rem);line-height:1.35;color:var(--forest)">${esc(r.steps[k])}</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px"><button class="btn btn-soft" id="ckP" ${k?'':'disabled'}>${icon('left')}Précédent</button><button class="btn btn-primary" id="ckN">${k===r.steps.length-1?'Bon appétit ! 🍽️':'Suivant'}${icon('right')}</button></div>
    <div style="height:6px;background:var(--paper-2);border-radius:9px;margin-top:30px;overflow:hidden"><div style="height:100%;width:${(k+1)/r.steps.length*100}%;background:var(--ochre)"></div></div></div>`;
    $('#ckN').onclick = () => { if(k < r.steps.length-1){ k++; show(); } else closeDrawer(); }; $('#ckP').onclick = () => { if(k){ k--; show(); } }; };
  openDrawer(`<span class="muted" style="font-size:.8rem;font-weight:800;text-transform:uppercase">Mode cuisine · l'écran reste allumé</span><h3>${esc(r.name)}</h3>`, '');
  show();
  if(navigator.wakeLock) navigator.wakeLock.request('screen').then(w => wake = w).catch(()=>{});
}
renderFood();

/* ---------- Histoire ---------- */
const HT = [['frise','Frise du temps'],['lieux','À voir au village'],['legendes','Légendes'],['famille','Histoires de la maison']]; let ht = 'frise';
$('#histTabs').innerHTML = HT.map(([k,t]) => `<button class="fchip ${k===ht?'on':''}" data-k="${k}">${t}</button>`).join('');
$('#histTabs').onclick = e => { const b = e.target.closest('button'); if(!b) return; ht = b.dataset.k; $$('#histTabs .fchip').forEach(x => x.classList.toggle('on', x===b)); renderHist(); };
function renderHist(){
  const B = $('#histBody');
  if(ht==='frise'){
    const yr = t => { const m = String(t.year).match(/(1[0-9]{3}|20[0-9]{2})/); return m ? +m[1] : (/antiq|romaine/i.test(t.year) ? 100 : /Xe/.test(t.year) ? 990 : 3000); };
    const all = [...C.history.timeline.map(t => ({...t, k:yr(t)})), ...S.map(s => ({year:s.year, title:s.title, text:s.text, photo:s.photo, family:true, k: yr(s)===3000 ? 2100 : yr(s)}))].sort((a,b) => a.k-b.k);
    B.innerHTML = `<div class="tl-filter filters" style="margin-bottom:14px"><span class="muted" style="font-weight:700;font-size:.85rem;align-self:center">Afficher :</span><button class="fchip on" data-tf="all">Tout</button><button class="fchip" data-tf="war">Les guerres</button><button class="fchip" data-tf="fam">Histoires de la maison</button></div>
    <div class="timeline">${all.map(t => `<div class="tl reveal ${t.family?'fam':''} ${/1914|1940|1942|1944/.test(t.year)?'war':''}"><div class="tl-y">${esc(t.year)}</div><div class="card tl-c">${t.family?`<span class="hand" style="font-size:1.25rem">Histoire de la maison</span>`:''}${t.photo?`<img src="${t.photo}" alt="" class="tl-img">`:''}<h4>${esc(t.title)}</h4><p>${esc(t.text)}</p>${t.source?`<a class="muted" style="font-size:.78rem" href="${t.source}" target="_blank" rel="noopener">Source ↗</a>`:''}</div></div>`).join('')}<div class="tl-progress"></div></div>`;
    B.querySelector('.tl-filter').onclick = e => { const b = e.target.closest('[data-tf]'); if(!b) return; $$('.tl-filter .fchip').forEach(x => x.classList.toggle('on', x===b));
      $$('.timeline .tl').forEach(n => n.style.display = b.dataset.tf==='all' || n.classList.contains(b.dataset.tf) ? '' : 'none'); };
  }
  if(ht==='lieux') B.innerHTML = `<div class="grid g3">${C.history.sites.map(s => { const km = s.lat ? haversine(HOUSE,[s.lat,s.lng]) : null; const id = 's:'+slug(s.name);
    return `<article class="card act" style="position:relative">${s.lat?favBtn(id):''}<div class="b"><span class="cat" style="color:#7a4f8a">🏛️ ${km!=null?(km<1.5?'À pied depuis la maison':fmtKm(km)):''}</span><h4 style="padding-right:36px">${esc(s.name)}</h4><p>${esc(s.text)}</p>
    <div class="meta">${s.lat?`<a href="#explorer" data-fly="${s.lat},${s.lng}">Voir sur la carte</a>`:''}<span class="grow"></span>${s.source?`<a href="${s.source}" target="_blank" rel="noopener">Source ↗</a>`:''}</div></div></article>`; }).join('')}</div>`;
  if(ht==='legendes') B.innerHTML = `<div class="grid g2">${C.history.legends.map(l => `<article class="card act legend"><div class="b"><span class="hand" style="font-size:1.4rem">Il était une fois…</span><h4>${esc(l.title)}</h4><p>${esc(l.text)}</p></div></article>`).join('')}</div>`;
  if(ht==='famille') B.innerHTML = `<p class="muted" style="margin-top:0">Les souvenirs de ceux qui ont fait revivre Belizel.</p><div class="grid g3">${S.map(s => `<article class="card room"><img src="${s.photo}" alt=""><div class="b"><span class="hand" style="font-size:1.3rem">${esc(s.year)}</span><h4>${esc(s.title)}</h4><p style="margin:0;font-size:.93rem;color:var(--ink-2)">${esc(s.text)}</p></div></article>`).join('')}</div>`;
  revealAll();
}
renderHist();

/* ---------- Culture ---------- */
const CCAT = {langue:'🗣️',traditions:'🎉',art:'🎨',musée:'🖼️',littérature:'📚',musique:'🎷',légende:'🧚',nature:'🌿'};
$('#cultureGrid').innerHTML = C.culture.map(c => `<article class="card act reveal"><div class="b"><span class="cat" style="color:var(--semois)">${CCAT[c.category]||'✨'} ${esc(c.category)}</span><h4>${esc(c.title)}</h4><p>${esc(c.text)}</p>
  <div class="meta"><span class="grow"></span>${c.lat?`<a href="#explorer" data-fly="${c.lat},${c.lng}">Carte</a>`:''}${c.url?`<a href="${c.url}" target="_blank" rel="noopener">En savoir plus ↗</a>`:''}</div></div></article>`).join('');

/* ---------- Mon séjour ---------- */
let plan = store.get('plan', {});
(function readShared(){ const m = location.hash.match(/^#plan=(.+)$/); if(!m) return;
  try{ const p = JSON.parse(decodeURIComponent(escape(atob(m[1])))); favs = [...new Set([...favs, ...p.f])]; plan = p.p; store.set('favs',favs); store.set('plan',plan); toast('Programme partagé importé ✨'); history.replaceState(null,'','#sejour'); }catch(e){} })();
function nDays(){ if(stay){ const n = Math.round((new Date(stay.out)-new Date(stay.in))/864e5); if(n>0) return Math.min(n+1,14); } return store.get('ndays', 3); }
$('#nDays').innerHTML = Array.from({length:14},(_,i)=>`<option value="${i+1}">${i+1} jour${i?'s':''}</option>`).join('');
$('#nDays').onchange = () => { store.set('ndays', +$('#nDays').value); renderPlanner(); };
function itemRow(id, removable){ const it = items[id]; if(!it) return '';
  return `<div class="item" draggable="true" data-id="${esc(id)}"><span class="k" style="background:${it.color||'#3c6e7c'}22">${it.emoji}</span><span>${esc(it.name)}<br><small class="muted">${it.type}${it.minutes?' · '+fmtDur(it.minutes):''}</small></span>
  ${removable?`<button class="x" data-unplan="${esc(id)}" title="Retirer de ce jour">${icon('close')}</button>`:`<select class="field" data-assign="${esc(id)}" style="margin-left:auto;padding:4px 6px;font-size:.75rem" title="Choisir un jour"><option value="">Jour…</option>${Array.from({length:nDays()},(_,i)=>`<option value="${i}">J${i+1}</option>`).join('')}</select>`}</div>`; }
function renderPlanner(){
  const nd = nDays(); $('#nDays').value = nd; $('#nDays').disabled = !!stay;
  $('#planDates').textContent = stay ? `du ${new Date(stay.in).toLocaleDateString('fr-BE')} au ${new Date(stay.out).toLocaleDateString('fr-BE')}` : 'Indiquez vos dates dans l\'agenda pour les caler sur votre séjour.';
  const planned = new Set(Object.values(plan).flat());
  const pool = favs.filter(f => !planned.has(f) && items[f]);
  $('#pool').innerHTML = pool.map(id => itemRow(id,false)).join('') || `<div class="empty">${favs.length?'Tout est planifié 👌':'Ajoutez des favoris ♥ depuis les balades, activités, restaurants ou l\'agenda.'}</div>`;
  $('#days').innerHTML = Array.from({length:nd},(_,i) => { const d = stay ? new Date(new Date(stay.in).getTime()+i*864e5) : null; const list = (plan[i]||[]).filter(id => items[id]);
    const mins = list.reduce((s,id)=>s+(items[id].minutes||90),0);
    return `<div class="day" data-day="${i}"><h4>Jour ${i+1}<small>${d?d.toLocaleDateString('fr-BE',{weekday:'short',day:'numeric',month:'short'}):''}${list.length?' · ~'+fmtDur(mins):''}</small></h4>${list.map(id=>itemRow(id,true)).join('') || '<div class="empty">Glissez une activité ici</div>'}</div>`; }).join('');
  updateFavCount();
}
document.addEventListener('dragstart', e => { const it = e.target.closest('.item'); if(it){ e.dataTransfer.setData('text/plain', it.dataset.id); } });
document.addEventListener('dragover', e => { const d = e.target.closest('.day'); if(d){ e.preventDefault(); d.classList.add('over'); } });
document.addEventListener('dragleave', e => { const d = e.target.closest('.day'); if(d) d.classList.remove('over'); });
document.addEventListener('drop', e => { const d = e.target.closest('.day'); if(!d) return; e.preventDefault(); d.classList.remove('over'); assign(e.dataTransfer.getData('text/plain'), +d.dataset.day); });
document.addEventListener('change', e => { const s = e.target.closest('[data-assign]'); if(s && s.value!=='') assign(s.dataset.assign, +s.value); });
document.addEventListener('click', e => { const b = e.target.closest('[data-unplan]'); if(b){ Object.keys(plan).forEach(k => plan[k] = plan[k].filter(x => x!==b.dataset.unplan)); store.set('plan',plan); renderPlanner(); } });
function assign(id, day){ Object.keys(plan).forEach(k => plan[k] = plan[k].filter(x => x!==id)); (plan[day] = plan[day]||[]).push(id); store.set('plan', plan); renderPlanner(); }
$('#planIcs').onclick = () => { const base = stay ? new Date(stay.in) : new Date(); const evs = [];
  Object.entries(plan).forEach(([d,ids]) => ids.forEach(id => { const it = items[id]; if(!it) return; const s = new Date(base.getTime()+d*864e5).toISOString().slice(0,10); const e2 = new Date(base.getTime()+(+d+1)*864e5).toISOString().slice(0,10);
    evs.push({start:s,end:e2,title:`${it.emoji} ${it.name}`,place:`${it.lat},${it.lng}`,desc:`${it.type} – https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}`}); }));
  if(!evs.length) return toast('Planifiez d\'abord quelques activités'); download('mon-sejour-belizel.ics', ics(evs), 'text/calendar'); };
$('#planShare').onclick = () => { const url = location.href.split('#')[0] + '#plan=' + btoa(unescape(encodeURIComponent(JSON.stringify({f:favs,p:plan}))));
  if(navigator.share) navigator.share({title:'Notre séjour à Belizel', url}).catch(()=>{}); else navigator.clipboard.writeText(url).then(() => toast('Lien copié : envoyez-le à vos compagnons de voyage')); };
$('#planPrint').onclick = () => { const w = open('', '_blank'); const nd = nDays();
  w.document.write(`<html><head><title>Mon séjour à Belizel</title><style>body{font-family:Georgia,serif;padding:30px;color:#2b2a25}h1{color:#2f4a34}h2{border-bottom:1px solid #ccc;padding-bottom:4px;color:#c4552c}li{margin:6px 0}</style></head><body><h1>Mon séjour à Belizel</h1>${
    Array.from({length:nd},(_,i)=>`<h2>Jour ${i+1}</h2><ul>${(plan[i]||[]).map(id=>items[id]?`<li><b>${items[id].name}</b> — ${items[id].type}</li>`:'').join('')||'<li>Journée libre</li>'}</ul>`).join('')
  }${MAN?`<p style="margin-top:30px;font-size:12px">Wifi : ${esc(M.wifi.ssid)} / ${esc(M.wifi.password)}</p>`:''}</body></html>`); w.document.close(); w.print(); };
renderPlanner();

/* ---------- Mode d'emploi ---------- */
// Avec Supabase : le mode d'emploi (wifi, boîte à clés) n'est servi qu'avec le code invité transmis dans le message Airbnb.
const todo = s => esc(s).replace(/\[([^\]]+)\]/g, '<span class="todo">$1</span>');
let MAN = SB.on ? null : M;
async function unlockManual(code){
  try{ const d = await SB.rpc('get_manual', {p_code: code}); if(d){ MAN = d; store.set('gcode', code); showManual(); return true; } }catch(e){}
  return false;
}
function lockScreen(){
  $('#manual').innerHTML = `<div class="lockbox">${icon('lock')}<h3 style="margin-top:8px">Réservé à nos hôtes</h3><p class="muted">Entrez le code reçu dans votre message de confirmation Airbnb.</p>
    <form id="codeForm" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><input class="field" id="gcode" placeholder="CODE" autocomplete="off"><button class="btn btn-primary">Ouvrir</button></form></div>`;
  $('#wifiCard').innerHTML = `<div style="text-align:center;width:100%">${icon('wifi')}<p class="muted" style="margin:6px 0 0">Le wifi s'affiche ici une fois le code saisi.</p></div>`;
  $('#codeForm').onsubmit = async e => { e.preventDefault(); if(!(await unlockManual($('#gcode').value))) toast('Code incorrect'); };
}
function showManual(){ M.wifi = MAN.wifi; M.sections = MAN.sections; renderManual(); renderWifi(); }
function renderManual(q=''){
  if(!MAN) return lockScreen();
  q = q.trim().toLowerCase();
  $('#manual').innerHTML = M.sections.map((s,i) => { const its = s.items.filter(it => !q || (it.q+' '+it.a+' '+s.title).toLowerCase().includes(q)); if(!its.length) return '';
    return `<div class="acc ${q||i===0?'open':''}"><button><span class="ico">${icon(s.icon)}</span>${esc(s.title)}${icon('chev','chev')}</button><div class="panel"><div><dl>${its.map(it => `<dt>${esc(it.q)}</dt><dd>${todo(it.a)}</dd>`).join('')}</dl></div></div></div>`; }).join('') || '<p style="padding:20px">Aucun résultat. Contactez-nous via Airbnb !</p>';
}
$('#manual').onclick = e => { const b = e.target.closest('.acc>button'); if(b) b.parentElement.classList.toggle('open'); };
$('#manSearch').oninput = e => renderManual(e.target.value);
function renderWifi(){
  const wifiStr = `WIFI:T:WPA;S:${M.wifi.ssid};P:${M.wifi.password};;`;
  let qrHtml = ''; try{ const qr = qrcode(0,'M'); qr.addData(wifiStr); qr.make(); qrHtml = qr.createSvgTag({cellSize:4, margin:0, scalable:true}); }catch(e){}
  $('#wifiCard').innerHTML = `<div class="qr">${qrHtml}</div><div><span class="muted" style="font-weight:800;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em">${icon('wifi')} Wifi</span><h4 style="margin:4px 0">${todo(M.wifi.ssid)}</h4>
    <div>Mot de passe : <b>${todo(M.wifi.password)}</b></div><button class="btn btn-soft btn-sm" style="margin-top:10px" id="cpWifi">Copier le mot de passe</button></div>`;
  $('#cpWifi').onclick = () => navigator.clipboard.writeText(M.wifi.password).then(() => toast('Mot de passe copié'));
}
renderManual(); if(MAN) renderWifi();
if(SB.on){ const qc = new URLSearchParams(location.search).get('code') || store.get('gcode', null); if(qc) unlockManual(qc); }
// Contenus éditables depuis l'admin (histoires de la maison…)
if(SB.on) SB.select('content','select=key,data').then(rows => { rows.forEach(r => { if(r.key==='stories' && Array.isArray(r.data)){ S.length = 0; S.push(...r.data); if(ht==='famille'||ht==='frise') renderHist(); } }); }).catch(()=>{});

/* ---------- Bienvenue, visite guidée, guide ---------- */
function startTour(){
  $('#welcome').classList.remove('on');
  Tour([
    {title:'Bienvenue à Belizel 👋', text:'Cette visite express vous montre comment tirer le meilleur de ce guide. Vous pouvez la quitter à tout moment (Échap).'},
    {el:'#today .card', title:'La météo et l\'idée du jour', text:'Météo en direct à Izel et une suggestion adaptée au temps : balade s\'il fait beau, visite à l\'abri s\'il pleut.'},
    {el:'#explorer .mapbox', title:'La carte interactive', text:'Activez les calques (balades, activités, restaurants, histoire, événements) et cliquez sur un tracé pour ouvrir sa fiche.'},
    {el:'#hikes .hike', title:'Les balades balisées', text:'Chaque fiche montre le tracé, le dénivelé et le profil d\'altitude. Téléchargez le GPX pour vous guider sur votre téléphone.'},
    {el:'#activites .hike-tools', title:'Activités, même sous la pluie', text:'Filtrez par envie et activez « Spécial jour de pluie » pour ne garder que les activités à l\'abri.'},
    {el:'#agenda .stay-box', title:'Votre séjour dans l\'agenda', text:'Entrez vos dates : l\'agenda ne garde que les événements pendant votre séjour, et vous pouvez les ajouter à votre calendrier.'},
    {el:'#terroir .filters', title:'Le terroir', text:'Spécialités, bonnes tables et producteurs, avec des recettes gaumaises à cuisiner pas à pas en mode cuisine.'},
    {el:'#sejour .planner', title:'Mon séjour', text:'Tous vos ♥ arrivent ici. Glissez-les dans vos journées, puis exportez vers votre agenda, imprimez ou partagez le programme.'},
    {el:'#wifiCard', title:'Sur place', text:'Scannez le QR code pour le wifi. Le mode d\'emploi répond à toutes les questions sur la maison.'},
    {el:'#btnHelp', title:'Besoin d\'aide ?', text:'Ce bouton relance la visite à tout moment. Bon séjour en Gaume ! 🌿', block:'start'}
  ], 'toured').start();
}
$('#btnHelp').onclick = startTour; $('#tourLink').onclick = e => { e.preventDefault(); startTour(); };
$('#wTour').onclick = startTour; $('#wSkip').onclick = () => { $('#welcome').classList.remove('on'); store.set('toured', true); };
$('#guideLink').onclick = e => { e.preventDefault(); openDrawer('<h3>Guide d\'utilisation</h3>', `
  <h4>${icon('map')} La carte</h4><p>Les boutons en haut de la carte affichent ou masquent chaque catégorie. En bas à droite, choisissez le fond : relief, plan ou satellite. Cliquez sur un tracé de balade pour ouvrir sa fiche.</p>
  <h4>${icon('download')} Les fichiers GPX</h4><p>Le bouton « Télécharger le GPX » enregistre le tracé. Sur téléphone, ouvrez-le avec une application de randonnée (Komoot, Visorando, OsmAnd, Organic Maps…) ou importez-le dans votre montre GPS (Garmin Connect, Suunto…). Le suivi fonctionne sans réseau une fois la carte téléchargée dans l'application.</p>
  <h4>${icon('heart')} Favoris et Mon séjour</h4><p>Le cœur ♥ ajoute un élément à « Mon séjour ». Sur ordinateur, glissez-déposez les éléments dans les journées ; sur téléphone, utilisez le menu « Jour… ». Tout est enregistré sur votre appareil, sans compte. « Partager » génère un lien qui transmet votre programme.</p>
  <h4>${icon('cal')} Agenda</h4><p>Renseignez vos dates : la pastille orange signale les mois de votre séjour. « + Mon agenda » ajoute un événement à votre calendrier (.ics).</p>
  <h4>${icon('chef')} Mode cuisine</h4><p>Les recettes s'affichent étape par étape en grand, et l'écran reste allumé pendant que vous cuisinez.</p>
  <h4>${icon('wifi')} Hors connexion</h4><p>La météo et les fonds de carte demandent une connexion. Le reste du guide s'affiche normalement.</p>`); };
if(!store.get('toured', false)) setTimeout(() => $('#welcome').classList.add('on'), 1800);
if(location.hash === '#tour') setTimeout(startTour, 800);

revealAll();
addEventListener('scroll', () => { const tl = $('.timeline'), pr = $('.tl-progress'); if(!tl || !pr) return; const r = tl.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight*0.6 - r.top) / r.height)); pr.style.height = (p*100)+'%'; }, {passive:true});
})();
