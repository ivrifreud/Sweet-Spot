"""Convert Moogi's Mixkit downloads into committed 44.1 kHz WAVs."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "assets" / "audio"
RAW = AUDIO / "_raw"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
DOWNLOADS = Path.home() / "Downloads"

# dest, source filename, kind, optional max seconds
INGEST: list[tuple[str, str, str, float | None]] = [
    ("fold.wav", "mixkit-quick-rope-throw-730.mp3", "sting", 1.6),
    ("correct.wav", "correct feedback.mp3", "sting", None),
    ("incorrect.wav", "ES_Voices, Male, In Peril, Says No 01 - Epidemic Sound.mp3", "sting", None),
    ("idle-snore.wav", "mixkit-man-strong-snore-2478.wav", "sting", 3.8),
    ("idle-yawn.wav", "mixkit-young-tired-male-yawns-2278.wav", "sting", 3.8),
    ("garden-ambience.wav", "mixkit-morning-birds-2472.wav", "bed", None),
    ("poker-table.wav", "playing poker sound.mp3", "bed", None),
    ("shuffle.wav", "card shuffle sound.mp3", "sting", 2.4),
    ("step.wav", "mixkit-footsteps-on-tall-grass-532.wav", "walk", None),
]


def ffmpeg(args: list[str]) -> None:
    subprocess.run([FFMPEG, "-y", *args], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def convert(src: Path, dest: Path, kind: str, max_seconds: float | None) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if kind == "bed":
        ffmpeg(
            [
                "-stream_loop",
                "-1",
                "-i",
                str(src),
                "-t",
                "24",
                "-ac",
                "2",
                "-ar",
                "44100",
                "-sample_fmt",
                "s16",
                "-af",
                "loudnorm=I=-22:LRA=11:TP=-8,afade=t=in:st=0:d=0.35,afade=t=out:st=23.55:d=0.45",
                str(dest),
            ]
        )
        return
    if kind == "walk":
        ffmpeg(
            [
                "-stream_loop",
                "-1",
                "-i",
                str(src),
                "-t",
                "8",
                "-ac",
                "2",
                "-ar",
                "44100",
                "-sample_fmt",
                "s16",
                "-af",
                "loudnorm=I=-20:LRA=9:TP=-8,afade=t=in:st=0:d=0.12,afade=t=out:st=7.7:d=0.3",
                str(dest),
            ]
        )
        return
    duration = f"{max_seconds:.2f}" if max_seconds else "4.0"
    ffmpeg(
        [
            "-i",
            str(src),
            "-t",
            duration,
            "-ac",
            "1",
            "-ar",
            "44100",
            "-sample_fmt",
            "s16",
            "-af",
            "loudnorm=I=-16:LRA=7:TP=-6",
            str(dest),
        ]
    )


def main() -> int:
    AUDIO.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    failed = 0
    for dest_name, source_name, kind, max_seconds in INGEST:
        src = DOWNLOADS / source_name
        if not src.exists():
            print(f"MISSING {src}")
            failed += 1
            continue
        raw = RAW / source_name
        shutil.copyfile(src, raw)
        dest = AUDIO / dest_name
        try:
            convert(raw, dest, kind, max_seconds)
            print(f"WAV {dest.name} ({dest.stat().st_size} bytes) from {source_name}")
        except Exception as exc:
            failed += 1
            print(f"FAIL {dest_name}: {exc}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
