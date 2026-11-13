"""Vidéos Belizel : l'application est pilotée par Playwright et enregistrée en 1920x1080, voix off native francophone (edge-tts, voix belges)
ou ElevenLabs (mise en cache), musique originale (music.py), sous-titres incrustés.

Usage : python video/make_video.py guest|owner
Sortie : video/out/belizel-<guest|owner>.mp4
La clé ELEVENLABS_API_KEY est lue dans .env (jamais affichée).
"""
import asyncio, hashlib, json, os, subprocess, sys, time, urllib.request, shutil, socket
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'video' / 'out'; TTS = OUT / 'tts'
PORT = 8812
W, H = 1920, 1080
sys.path.insert(0, str(ROOT / 'video'))
from scenes import VIDEOS  # noqa: E402

def env_key():
    for line in open(ROOT / '.env', encoding='utf-8'):
        if line.startswith('ELEVENLABS_API_KEY='): return line.split('=', 1)[1].strip()
    raise SystemExit('ELEVENLABS_API_KEY manquante dans .env')

# Prononciations locales (voix off seulement ; les sous-titres gardent l'orthographe) : « Gaume » se dit /ɡom/, e muet.
PRONONCIATION = {'Gaume': 'Gôme'}
# Réglages edge-tts par voix (débit, hauteur) pour une diction plus vivante
PROSODIE = {'fr-BE-CharlineNeural': ('+3%', '+3Hz'), 'fr-BE-GerardNeural': ('+2%', '+2Hz'), 'nl-BE-DenaNeural': ('+3%', '+2Hz')}
PRONONCIATION_NL = {'Gaumse': 'Gomse', 'Gaume': 'Goom'}

def tts(text, voice):
    for mot, dit in (PRONONCIATION_NL if voice.startswith('nl-') else PRONONCIATION).items(): text = text.replace(mot, dit)
    TTS.mkdir(parents=True, exist_ok=True)
    rate, pitch = PROSODIE.get(voice, ('-3%', '+0Hz'))
    f = TTS / (hashlib.sha1((voice + '|' + rate + pitch + '|' + text).encode()).hexdigest()[:16] + '.mp3')
    if not f.exists() and voice.endswith('Neural'):
        # voix neuronales Microsoft natives (edge-tts) : fr-BE-CharlineNeural, fr-BE-GerardNeural…
        subprocess.run([sys.executable, '-m', 'edge_tts', '--voice', voice, f'--rate={rate}', f'--pitch={pitch}', '--text', text, '--write-media', str(f)], check=True, capture_output=True)
    if not f.exists():
        body = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2',
                           'voice_settings': {'stability': 0.55, 'similarity_boost': 0.75, 'style': 0.15, 'use_speaker_boost': True}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}', data=body,
              headers={'xi-api-key': env_key(), 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
        f.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    return f

def duration(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True)
    return float(r.stdout.strip())

HELPERS = r"""
window.__ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
window.__scrollTo = (y, ms) => new Promise(res => { const y0 = scrollY, t0 = performance.now(); const el = document.scrollingElement;
  el.style.scrollBehavior = 'auto'; document.documentElement.style.scrollBehavior = 'auto';
  const f = now => { const t = Math.min(1,(now-t0)/ms); scrollTo(0, y0 + (y-y0)*__ease(t)); t<1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
window.__scrollEl = (sel, ms, off) => { const e = document.querySelector(sel); if(!e) return; const y = e.getBoundingClientRect().top + scrollY - (off||90); return __scrollTo(y, ms); };
window.__scrollIn = (sel, dy, ms) => { const e = document.querySelector(sel); if(!e) return; const y0 = e.scrollTop, t0 = performance.now();
  return new Promise(res => { const f = now => { const t = Math.min(1,(now-t0)/ms); e.scrollTop = y0 + dy*__ease(t); t<1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }); };
"""

async def run_action(page, a):
    kind = a[1]
    try:
        if kind == 'scroll': await page.evaluate(f"__scrollEl({json.dumps(a[2])}, {a[3] if len(a)>3 else 1400}, {a[4] if len(a)>4 else 90})")
        elif kind == 'scrollby': await page.evaluate(f"__scrollTo(scrollY + {a[2]}, {a[3] if len(a)>3 else 1400})")
        elif kind == 'scrollin': await page.evaluate(f"__scrollIn({json.dumps(a[2])}, {a[3]}, {a[4] if len(a)>4 else 1400})")
        elif kind == 'click':
            try: await page.click(a[2], timeout=1500)
            except Exception: await page.evaluate(f"document.querySelector({json.dumps(a[2])})?.click()")
        elif kind == 'hover': await page.hover(a[2], timeout=3000)
        elif kind == 'js': await page.evaluate(a[2])
        elif kind == 'goto': await page.goto(f'http://localhost:{PORT}/{a[2]}', wait_until='networkidle'); await page.evaluate(HELPERS)
        elif kind == 'mouse': await page.mouse.move(a[2], a[3], steps=a[4] if len(a)>4 else 25)
        elif kind == 'sweep':
            box = await page.locator(a[2]).first.bounding_box()
            if box:
                y = box['y'] + box['height'] * 0.5
                await page.mouse.move(box['x'] + 5, y); await page.mouse.move(box['x'] + box['width'] - 5, y, steps=a[3] if len(a) > 3 else 80)
        elif kind == 'drag':
            await page.mouse.move(a[2], a[3]); await page.mouse.down(); await page.mouse.move(a[4], a[5], steps=30); await page.mouse.up()
    except Exception as e:
        print('   action', a, '->', type(e).__name__, str(e)[:120])

async def record(video, scenes):
    rec = OUT / ('rec_' + video); shutil.rmtree(rec, ignore_errors=True); rec.mkdir(parents=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--force-color-profile=srgb', '--hide-scrollbars'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, record_video_dir=str(rec), record_video_size={'width': W, 'height': H}, locale='fr-BE')
        await ctx.add_init_script("try{['belizel.toured','belizel.adm.toured'].forEach(k=>localStorage.setItem(k,'true'))}catch(e){}")
        await ctx.add_init_script(HELPERS)
        page = await ctx.new_page(); t0 = time.monotonic()
        marks = []
        for i, s in enumerate(scenes):
            if s.get('url'):
                await page.goto(f"http://localhost:{PORT}/{s['url']}", wait_until='networkidle'); await page.wait_for_timeout(600)
            for a in s.get('before', []): await run_action(page, (0,) + tuple(a[1:]) if isinstance(a, tuple) else a)
            start = time.monotonic() - t0; marks.append(start)
            print(f"  scène {i+1}/{len(scenes)} « {s['id']} » à {start:.1f} s ({s['dur']:.1f} s)")
            ts = time.monotonic()
            for a in sorted(s.get('actions', []), key=lambda x: x[0]):
                wait = a[0] - (time.monotonic() - ts)
                if wait > 0: await asyncio.sleep(wait)
                asyncio.ensure_future(run_action(page, a))
            rest = s['dur'] - (time.monotonic() - ts)
            if rest > 0: await asyncio.sleep(rest)
        end = time.monotonic() - t0
        await ctx.close(); vid = await page.video.path(); await b.close()
    return Path(vid), marks, end

def srt_time(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h):02}:{int(m):02}:{int(s):02},{int((s - int(s)) * 1000):03}"

def build(video):
    cfg = VIDEOS[video]; scenes = cfg['scenes']; voice = cfg['voice']
    print('Voix off…')
    for s in scenes:
        s['mp3'] = tts(s['vo'], voice) if s.get('vo') else None
        s['vdur'] = duration(s['mp3']) if s['mp3'] else 0
        s['dur'] = max(s.get('min', 0), s['vdur'] + s.get('pad', 1.0) + 0.4)
    print('Enregistrement…')
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '-d', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(40):
            try: socket.create_connection(('localhost', PORT), 0.3).close(); break
            except OSError: time.sleep(0.2)
        vid, marks, end = asyncio.run(record(video, scenes))
    finally:
        srv.terminate()
    t_first = marks[0]; total = end - t_first
    # musique
    music = OUT / f'music_{video}.wav'
    subprocess.run([sys.executable, '-I', str(ROOT / 'video' / 'music.py'), str(music), str(total + 1)], check=True)
    # sous-titres
    lines = []; n = 1
    for s, m in zip(scenes, marks):
        if not s.get('vo'): continue
        chunks = s.get('sub') or [s['vo']]; L = sum(len(c) for c in chunks); t = m - t_first + 0.3
        for c in chunks:
            d = s['vdur'] * len(c) / L
            lines.append(f"{n}\n{srt_time(t)} --> {srt_time(t + d - 0.05)}\n{c}\n"); n += 1; t += d
    srt = OUT / f'{video}.srt'; srt.write_text('\n'.join(lines), encoding='utf-8')
    # mixage
    inputs = ['-ss', f'{t_first:.2f}', '-i', str(vid), '-i', str(music)]; filt = []; labels = []
    k = 2
    for s, m in zip(scenes, marks):
        if not s['mp3']: continue
        inputs += ['-i', str(s['mp3'])]; ms = int((m - t_first + 0.3) * 1000)
        filt.append(f"[{k}:a]adelay={ms}|{ms},volume=1.6[v{k}]"); labels.append(f"[v{k}]"); k += 1
    filt.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0,asplit=2[vo][vo2]")
    filt.append(f"[1:a]volume={cfg.get('music_vol', 0.16)},afade=t=out:st={max(0, total-3):.2f}:d=3[mu]")
    filt.append("[mu][vo]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600[duck]")
    filt.append("[duck][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[aout]")
    style = "Fontname=Nunito Sans,Fontsize=17,PrimaryColour=&H00FFFFFF,OutlineColour=&H00202A1F,BackColour=&H8C1F2A1E,BorderStyle=4,Outline=0,Shadow=0,MarginV=38,Bold=1"
    filt.append(f"[0:v]fps=30,subtitles={srt.name}:force_style='{style}',fade=t=in:st=0:d=0.8,fade=t=out:st={max(0,total-1.2):.2f}:d=1.2[vout]")
    out = OUT / f'belizel-{video}.mp4'
    cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[vout]', '-map', '[aout]',
           '-t', f'{total:.2f}', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(out)]
    subprocess.run(cmd, check=True, cwd=OUT)
    print(f'-> {out} ({total:.0f} s)')

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'guest')
