"""Fetch CC0 / Mixkit cues into my-expo-app/assets/audio as 44.1 kHz WAV."""

from __future__ import annotations

import json
import subprocess
import sys
import urllib.request
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "assets" / "audio"
RAW = AUDIO / "_raw"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
UA = "SweetSpotAudioFetch/1.0"

KENNEY_CASINO = "https://cc0-sounds.exi.software/sounds/kenney_casinoaudio/Audio"
KENNEY_UI = "https://cc0-sounds.exi.software/sounds/kenney_interfacesounds/Audio"
KENNEY_RPG = "https://cc0-sounds.exi.software/sounds/kenney_rpgaudio/Audio"
KENNEY_IMPACT = "https://cc0-sounds.exi.software/sounds/kenney_impactsounds/Audio"
MIXKIT = "https://assets.mixkit.co/active_storage/sfx"

# name -> url, license, creator, page, notes, kind (sfx|bed)
CUES: list[tuple[str, str, str, str, str, str, str]] = [
    ("deal.wav", f"{KENNEY_CASINO}/cardSlide1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "card flick", "sfx"),
    ("peek.wav", f"{KENNEY_CASINO}/cardTakeOutPackage1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "card lift", "sfx"),
    ("settle.wav", f"{KENNEY_CASINO}/cardPlace1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "card drop table", "sfx"),
    ("fold.wav", f"{KENNEY_CASINO}/cardShove1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "cards slide felt", "sfx"),
    ("chip-pickup.wav", f"{KENNEY_CASINO}/chipsHandle1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "chips grab", "sfx"),
    ("call.wav", f"{KENNEY_CASINO}/chipLay1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "single chip clack", "sfx"),
    ("raise.wav", f"{KENNEY_CASINO}/chipsCollide1.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "chip stack clink", "sfx"),
    ("jackpot.wav", f"{KENNEY_CASINO}/chipsHandle3.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "chip cascade", "jackpot"),
    ("jackpot-heavy.wav", f"{KENNEY_CASINO}/chipsStack3.ogg", "CC0", "Kenney", "https://kenney.nl/assets/casino-audio", "heavy chip dump", "jackpot"),
    ("correct.wav", f"{KENNEY_UI}/confirmation_002.ogg", "CC0", "Kenney", "https://kenney.nl/assets/interface-sounds", "ascending UI chime", "sfx"),
    ("arrive.wav", f"{KENNEY_UI}/confirmation_001.ogg", "CC0", "Kenney", "https://kenney.nl/assets/interface-sounds", "node arrival", "sfx"),
    ("ui-click.wav", f"{KENNEY_UI}/switch_001.ogg", "CC0", "Kenney", "https://kenney.nl/assets/interface-sounds", "elegant UI click", "sfx"),
    ("incorrect.wav", f"{KENNEY_IMPACT}/impactWood_medium_000.ogg", "CC0", "Kenney", "https://kenney.nl/assets/impact-sounds", "warm wood thunk", "sfx"),
    ("step.wav", f"{KENNEY_RPG}/footstep00.ogg", "CC0", "Kenney", "https://kenney.nl/assets/rpg-audio", "one footstep", "sfx"),
    ("clouds.wav", f"{MIXKIT}/1489/1489.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/whoosh/", "soft whoosh / fog part", "sfx"),
    ("garden-ambience.wav", f"{MIXKIT}/17/17.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/bird/", "little birds singing in the trees", "bed"),
    ("garden-night-ambience.wav", f"{MIXKIT}/1781/1781.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/cricket/", "crickets at night", "bed"),
    ("casino-day-ambience.wav", f"{MIXKIT}/470/470.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/arcade/", "arcade bed", "bed"),
    ("casino-night-ambience.wav", f"{MIXKIT}/511/511.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/fan/", "fan / ventilation hum", "bed"),
    ("vip-day-ambience.wav", f"{MIXKIT}/447/447.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/office/", "quiet room tone", "bed"),
    ("vip-night-ambience.wav", f"{MIXKIT}/1055/1055.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/clock/", "clock ticking", "bed"),
    ("incorrect-bass.wav", f"{MIXKIT}/2295/2295.wav", "Mixkit License", "Mixkit", "https://mixkit.co/free-sound-effects/bass/", "muted bass hit", "bass"),
]


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as res, dest.open("wb") as out:
        out.write(res.read())
    print(f"GET {url} -> {dest.name} ({dest.stat().st_size} bytes)")


def ffmpeg(args: list[str]) -> None:
    subprocess.run([FFMPEG, "-y", *args], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def convert(src: Path, dest: Path, kind: str) -> None:
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
    elif kind == "jackpot":
        ffmpeg(
            [
                "-i",
                str(src),
                "-t",
                "1.7",
                "-ac",
                "1",
                "-ar",
                "44100",
                "-sample_fmt",
                "s16",
                "-af",
                "loudnorm=I=-14:LRA=7:TP=-6",
                str(dest),
            ]
        )
    elif kind == "bass":
        ffmpeg(
            [
                "-i",
                str(src),
                "-t",
                "0.55",
                "-ac",
                "1",
                "-ar",
                "44100",
                "-sample_fmt",
                "s16",
                "-af",
                "loudnorm=I=-16:LRA=7:TP=-6,lowpass=f=240",
                str(dest),
            ]
        )
    else:
        ffmpeg(
            [
                "-i",
                str(src),
                "-t",
                "0.45",
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
    print(f"WAV {dest.name} ({dest.stat().st_size} bytes)")


def main() -> int:
    AUDIO.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    ok = []
    failed = []
    for name, url, license_, creator, page, notes, kind in CUES:
        ext = Path(url).suffix or ".bin"
        raw = RAW / f"{name}{ext}"
        dest = AUDIO / name
        try:
            download(url, raw)
            convert(raw, dest, kind)
            ok.append(
                {
                    "file": name,
                    "creator": creator,
                    "license": license_,
                    "source": url,
                    "page": page,
                    "notes": notes,
                }
            )
        except Exception as exc:
            failed.append({"file": name, "error": str(exc), "url": url})
            print(f"FAIL {name}: {exc}")
    (AUDIO / "asset-manifest.json").write_text(json.dumps({"ok": ok, "failed": failed}, indent=2), encoding="utf-8")
    print("DONE", len(ok), "ok;", len(failed), "failed")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
