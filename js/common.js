/* Belizel — utilitaires partagés (icônes, stockage, toast, visite guidée, GPX, ICS) */
(function(){
const P = {
  flame:'<path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.5-6-4-8-.5 2-1.5 3-3 3 0-3-1-6-4-8 .5 3-3 6-3 10 0 5.5 3 10 7 10z"/>',
  leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  bed:'<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  baby:'<circle cx="12" cy="6" r="3"/><path d="M8 21v-5l-3-3 3-2h8l3 2-3 3v5"/>',
  laptop:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  chef:'<path d="M6 13.9A4 4 0 0 1 7.2 6a5 5 0 0 1 9.6 0A4 4 0 0 1 18 13.9V21H6z"/><path d="M6 17h12"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  recycle:'<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7 9.7M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2M14 16l-3 3 3 3M8.3 13.6 7 9.7 3 11M9.3 5.6l1.1-1.9a1.8 1.8 0 0 1 3.1 0l3.9 6.8M13.4 10.6l3.9-1.1 1.1 3.9"/>',
  house:'<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
  door:'<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h20M13 20V4l-7 2v14M10 12v.01"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  nav:'<path d="m3 11 19-9-9 19-2-8z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  up:'<path d="m2 20 7-10 4 5 3-4 6 9z"/>',
  ruler:'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0zM14.5 12.5l2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  car:'<path d="M19 17h2v-5l-2-5H5L3 12v5h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6M3 12h18"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
  left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  rain:'<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2M16 14v6M8 14v6M12 16v6"/>',
  compass:'<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
  book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  sparkle:'<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  print:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  bike:'<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h2"/>',
  scroll:'<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  wifi:'<path d="M5 13a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
};
window.icon = (n, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]||P.star}</svg>`;
window.LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#c4552c"/><path d="M8 27c4-3 8-3 12 0s8 3 12 0" stroke="#f6f0e3" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M11 22 20 12l9 10" stroke="#f6f0e3" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M27 12v4" stroke="#f6f0e3" stroke-width="2.2" stroke-linecap="round"/></svg>`;

window.$ = (s, r=document) => r.querySelector(s);
window.$$ = (s, r=document) => [...r.querySelectorAll(s)];
window.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

window.store = {
  get(k, d){ try{ const v = localStorage.getItem('belizel.'+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('belizel.'+k, JSON.stringify(v)); }catch(e){} }
};

window.toast = (msg) => {
  let t = $('.toast'); if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('on'), 2600);
};

window.download = (name, text, type='text/plain') => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
};

window.haversine = (a, b) => { const R=6371, r=x=>x*Math.PI/180; const dLat=r(b[0]-a[0]), dLng=r(b[1]-a[1]);
  const h=Math.sin(dLat/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
// estimation du temps de route en Gaume (routes sinueuses) : ~1,3 × vol d'oiseau à 55 km/h
window.driveMin = km => Math.max(3, Math.round(km*1.3/55*60));

window.gpx = (name, coords, ele, desc='') => {
  const pts = coords.map((c,i)=>`      <trkpt lat="${c[0].toFixed(6)}" lon="${c[1].toFixed(6)}">${ele&&ele[i]!=null?`<ele>${Math.round(ele[i])}</ele>`:''}</trkpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Belizel – Guide de la Gaume" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(name)}</name><desc>${esc(desc)}</desc><link href="https://www.openstreetmap.org/copyright"><text>Données © contributeurs OpenStreetMap (ODbL)</text></link></metadata>
  <trk><name>${esc(name)}</name><trkseg>
${pts}
  </trkseg></trk>
</gpx>`;
};

window.gpxMulti = (title, tracks) => {
  const trk = tracks.map(t => `  <trk><name>${esc(t.name)}</name><desc>${esc(t.desc||'')}</desc><trkseg>
${t.coords.map((c,i)=>`    <trkpt lat="${c[0].toFixed(6)}" lon="${c[1].toFixed(6)}">${t.ele&&t.ele[i]!=null?`<ele>${Math.round(t.ele[i])}</ele>`:''}</trkpt>`).join('\n')}
  </trkseg></trk>`).join('\n');
  const wpt = tracks.map(t => `  <wpt lat="${t.coords[0][0].toFixed(6)}" lon="${t.coords[0][1].toFixed(6)}"><name>Départ · ${esc(t.name)}</name></wpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Belizel – Guide de la Gaume" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(title)}</name><link href="https://www.openstreetmap.org/copyright"><text>Données © contributeurs OpenStreetMap (ODbL)</text></link></metadata>
${wpt}
${trk}
</gpx>`;
};

/* Supabase (REST minimal, sans dépendance) — actif seulement si une clé anon est configurée */
window.SB = (() => {
  const cfg = window.BELIZEL_CONFIG || {}; const on = !!cfg.anonKey;
  const h = (extra={}) => ({apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, 'Accept-Profile': cfg.schema, 'Content-Profile': cfg.schema, 'Content-Type': 'application/json', ...extra});
  return { on,
    async select(table, q='select=*'){ const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${q}`, {headers: h()}); if(!r.ok) throw new Error(r.status); return r.json(); },
    async rpc(fn, args){ const r = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${fn}`, {method:'POST', headers: h(), body: JSON.stringify(args)}); if(!r.ok) throw new Error(r.status); return r.json(); }
  };
})();

window.ics = (events) => {
  const f = d => d.replace(/-/g,'');
  const body = events.map((e,i)=>[
    'BEGIN:VEVENT', `UID:belizel-${Date.now()}-${i}@belizel`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,
    `DTSTART;VALUE=DATE:${f(e.start)}`, `DTEND;VALUE=DATE:${f(e.end||e.start)}`,
    `SUMMARY:${(e.title||'').replace(/[,;]/g,' ')}`, `LOCATION:${(e.place||'').replace(/[,;]/g,' ')}`,
    `DESCRIPTION:${(e.desc||'').replace(/\n/g,'\\n').replace(/[,;]/g,' ')}`, 'END:VEVENT'].join('\r\n')).join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Belizel//Guide//FR\r\n${body}\r\nEND:VCALENDAR`;
};

/* ---------- Visite guidée (spotlight) ---------- */
window.Tour = function(steps, key){
  let i = 0, hole, pop;
  function end(){ hole?.remove(); pop?.remove(); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', place); if(key) store.set(key, true); }
  function onKey(e){ if(e.key==='Escape') end(); if(e.key==='ArrowRight') go(i+1); if(e.key==='ArrowLeft') go(i-1); }
  function place(){
    const s = steps[i]; const el = s.el ? $(s.el) : null;
    const vw = innerWidth, vh = innerHeight;
    if(el){
      const r = el.getBoundingClientRect(); const pad = s.pad ?? 8;
      Object.assign(hole.style,{left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+pad*2)+'px',height:(r.height+pad*2)+'px',opacity:1});
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let top = r.bottom + 18, left = Math.min(Math.max(16, r.left + r.width/2 - pw/2), vw - pw - 16);
      if(top + ph > vh - 16) top = r.top - ph - 18;
      if(top < 16) top = Math.min(vh - ph - 16, Math.max(16, r.top + 20));
      Object.assign(pop.style,{top:top+'px',left:left+'px'});
    } else {
      Object.assign(hole.style,{left:vw/2+'px',top:vh/2+'px',width:'0px',height:'0px'});
      Object.assign(pop.style,{top:(vh/2 - pop.offsetHeight/2)+'px',left:(vw/2 - pop.offsetWidth/2)+'px'});
    }
  }
  function go(n){
    if(n<0) return; if(n>=steps.length) return end();
    i = n; const s = steps[i];
    if(s.before) s.before();
    pop.innerHTML = `<h4>${s.title}</h4><p>${s.text}</p><div class="row"><div class="dots">${steps.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>
      <button class="skip">Passer</button>${i>0?'<button class="btn btn-soft btn-sm prev">Retour</button>':''}<button class="btn btn-primary btn-sm next">${i===steps.length-1?'Terminer':'Suivant'}</button></div>`;
    pop.querySelector('.skip').onclick = end; pop.querySelector('.next').onclick = () => go(i+1);
    const pv = pop.querySelector('.prev'); if(pv) pv.onclick = () => go(i-1);
    const el = s.el ? $(s.el) : null;
    if(el){ el.scrollIntoView({behavior:'smooth', block: s.block || 'center'}); setTimeout(place, 550); }
    place();
  }
  return { start(){ hole = document.createElement('div'); hole.className='tour-hole'; pop = document.createElement('div'); pop.className='tour-pop';
    document.body.append(hole, pop); document.addEventListener('keydown', onKey); window.addEventListener('resize', place); go(0); } };
};

/* Révélation au défilement */
window.revealAll = () => {
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.12});
  $$('.reveal:not(.in)').forEach(el => io.observe(el));
};
})();
