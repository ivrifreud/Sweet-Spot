"""Convert user-supplied WAVs into repo SFX (44.1 kHz, mono, 16-bit).

Do not reuse the default sfx branch in fetch-audio-assets.py — it hard-trims
to 0.45 s and would clip these cues.
"""

from __future__ import annotations

import contextlib
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "assets" / "audio"
RAW = AUDIO / "_raw"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
DOWNLOADS = Path.home() / "Downloads"

# (source in Downloads, dest in assets/audio, trim seconds or None = half the source)
JOBS = [
    ("dealing cards.wav", "deal.wav", 0.70),
    ("peeking the cards.wav", "peek.wav", 0.65),
    ("wind swoosh sound.wav", "wind-swoosh.wav", 1.90),
    ("conffeti sound.wav", "confetti.wav", None),
]


def wav_seconds(path: Path) -> float:
    with contextlib.closing(wave.open(str(path), "rb")) as handle:
        return handle.getnframes() / float(handle.getframerate())


def main() -> int:
    RAW.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name, seconds in JOBS:
        src = DOWNLOADS / src_name
        if not src.exists():
            print(f"MISSING {src}")
            return 1
        shutil.copy2(src, RAW / src_name)
        dest = AUDIO / dest_name
        trim = seconds if seconds is not None else wav_seconds(src) / 2.0
        subprocess.run(
            [
                FFMPEG,
                "-y",
                "-i",
                str(src),
                "-t",
                f"{trim:.3f}",
                "-ac",
                "1",
                "-ar",
                "44100",
                "-sample_fmt",
                "s16",
                "-af",
                "loudnorm=I=-16:LRA=7:TP=-6",
                str(dest),
            ],
            check=True,
        )
        print(f"WAV {dest.name} ({dest.stat().st_size} bytes, {trim:.3f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
