"""Original background music for the promo video, synthesized from scratch (no third-party audio, no licence issue).

Musique champêtre originale pour Belizel : 80 BPM en ré majeur (D - G - Bm - A), nappes douces,
arpège façon guitare picking dès la deuxième boucle, basse ronde, sans batterie électronique. Deterministic: the same file every run.
Usage: py -I video/music.py [out.wav] [seconds]   (default video/out/music.wav, 110 s)
"""
from __future__ import annotations

import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 80
BEAT = 60 / BPM
BAR = 4 * BEAT
# chord tones as MIDI notes (pad voicing) and bass root
CHORDS = [
    ([50, 54, 57, 62], 38),  # D
    ([55, 59, 62, 67], 43),  # G
    ([54, 59, 62, 66], 47),  # Bm
    ([52, 57, 61, 64], 45),  # A
]
BARS_PER_CHORD = 2


def hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n: int, attack: float, release: float) -> np.ndarray:
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 2
    if r:
        e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def pad_note(f: float, dur: float, rng: np.random.Generator) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for detune in (0.9985, 1.0, 1.0015):
        ph = rng.uniform(0, 2 * np.pi)
        for k in range(1, 7):
            out += (1 / k ** 1.6) * np.sin(2 * np.pi * k * f * detune * t + ph * k)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.2 * t + rng.uniform(0, 6))
    return out * lfo / 3


def pluck(f: float, dur: float) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    tone = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return tone * np.exp(-t * 5.5) * env(len(t), 0.004, 0.05)


def bass(f: float, dur: float) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return tone * np.exp(-t * 1.6) * env(len(t), 0.01, 0.08)


def kick(dur: float = 0.35) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    f = 45 + 75 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def add(buf: np.ndarray, sig: np.ndarray, start: float, gain: float, pan: float = 0.0) -> None:
    i = int(start * SR)
    if i >= buf.shape[0]:
        return
    n = min(len(sig), buf.shape[0] - i)
    left, right = gain * np.sqrt((1 - pan) / 2), gain * np.sqrt((1 + pan) / 2)
    buf[i:i + n, 0] += sig[:n] * left
    buf[i:i + n, 1] += sig[:n] * right


def compose(seconds: float) -> np.ndarray:
    rng = np.random.default_rng(2026)
    buf = np.zeros((int(seconds * SR) + SR, 2))
    loop = len(CHORDS) * BARS_PER_CHORD * BAR
    t0, step = 0.0, 0
    while t0 < seconds:
        notes, root = CHORDS[step % len(CHORDS)]
        n_loop = int(t0 // loop)
        dur = BARS_PER_CHORD * BAR
        for j, m in enumerate(notes):  # pad, overlapping the next chord a little
            sig = pad_note(hz(m), dur + 0.8, rng) * env(int((dur + 0.8) * SR), 0.9, 1.2)
            add(buf, sig, t0, 0.055, pan=(-0.35, 0.35, -0.15, 0.15)[j])
        for b in range(BARS_PER_CHORD * 4):  # bass on every beat, softer off the downbeat
            add(buf, bass(hz(root), BEAT * 0.95), t0 + b * BEAT, 0.16 if b % 2 == 0 else 0.10)
        if t0 >= BARS_PER_CHORD * BAR * 2:  # arpeggio (eighth notes) from the second loop
            arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12]
            for e in range(BARS_PER_CHORD * 8):
                add(buf, pluck(hz(arp[e % len(arp)]), BEAT * 1.4), t0 + e * BEAT / 2, 0.085, pan=0.4 if e % 2 else -0.4)
        t0 += dur
        step += 1
    buf = buf[: int(seconds * SR)]
    # light stereo echo for space
    d = int(BEAT * 0.75 * SR)
    echo = np.zeros_like(buf)
    echo[d:, 0] = buf[:-d, 1] * 0.22
    echo[d:, 1] = buf[:-d, 0] * 0.22
    buf += echo
    buf *= env(len(buf), 2.0, 3.0)[:, None]
    return buf / np.max(np.abs(buf)) * 0.89  # about -1 dBFS


def write_wav(path: Path, buf: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(buf, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent / "out" / "music.wav"
    secs = float(sys.argv[2]) if len(sys.argv) > 2 else 110.0
    write_wav(out, compose(secs))
    print(f"-> {out} ({secs:.0f} s)")
