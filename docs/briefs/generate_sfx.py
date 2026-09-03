"""Generate short original SFX wavs for Sweet Spot (no copyrighted samples)."""

from __future__ import annotations

import math
import os
import struct
import wave

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..", "my-expo-app", "assets", "audio")
RATE = 22050


def write_wav(name: str, samples: list[float], rate: int = RATE) -> None:
    os.makedirs(ROOT, exist_ok=True)
    path = os.path.join(ROOT, name)
    with wave.open(path, "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples)
        wav.writeframes(frames)


def tone(freq: float, ms: float, amp: float = 0.22, decay: bool = True) -> list[float]:
    n = int(RATE * ms / 1000)
    out = []
    for i in range(n):
        t = i / RATE
        env = math.exp(-t * (8 if decay else 1.2))
        out.append(math.sin(2 * math.pi * freq * t) * amp * env)
    return out


def noise(ms: float, amp: float = 0.12) -> list[float]:
    n = int(RATE * ms / 1000)
    seed = 1
    out = []
    for i in range(n):
        seed = (1103515245 * seed + 12345) & 0x7FFFFFFF
        t = i / RATE
        env = math.exp(-t * 14)
        out.append(((seed / 0x7FFFFFFF) * 2 - 1) * amp * env)
    return out


def main() -> None:
    write_wav("deal.wav", tone(420, 90, 0.16) + tone(510, 80, 0.12))
    write_wav("peek.wav", tone(180, 70, 0.1) + noise(40, 0.06))
    write_wav("settle.wav", tone(140, 80, 0.1))
    write_wav("fold.wav", noise(160, 0.14) + tone(90, 90, 0.08))
    write_wav("chip-pickup.wav", tone(680, 40, 0.14) + tone(820, 50, 0.1))
    write_wav("call.wav", tone(240, 50, 0.2) + noise(30, 0.08))
    write_wav("raise.wav", tone(240, 40, 0.16) + tone(300, 50, 0.14) + tone(360, 60, 0.12))
    write_wav("correct.wav", tone(523, 120, 0.18, False) + tone(659, 160, 0.16, False) + tone(784, 180, 0.14))
    write_wav("incorrect.wav", tone(196, 160, 0.18) + tone(147, 180, 0.14))
    write_wav("step.wav", noise(50, 0.09) + tone(110, 40, 0.08))
    write_wav("arrive.wav", tone(392, 80, 0.12) + tone(523, 100, 0.1))
    write_wav("clouds.wav", noise(420, 0.07) + tone(220, 200, 0.05))
    ambience = []
    for i in range(RATE * 4):
        t = i / RATE
        birds = 0.03 * math.sin(2 * math.pi * 3.1 * t) * math.sin(2 * math.pi * 880 * t)
        bed = 0.04 * math.sin(2 * math.pi * 110 * t)
        ambience.append(max(-0.2, min(0.2, birds + bed)))
    write_wav("garden-ambience.wav", ambience)


if __name__ == "__main__":
    main()
