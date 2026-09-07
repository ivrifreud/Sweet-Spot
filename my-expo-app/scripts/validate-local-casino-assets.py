"""Validate Local Casino map runtime assets against ASSET-SPEC.md."""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print(
        "Pillow is required for this offline check only. "
        "Install it in your environment (not as an app runtime dependency): pip install Pillow",
        file=sys.stderr,
    )
    raise SystemExit(2)

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "themes" / "local-casino"
WIDTH = 576
HEIGHT = 1024

CHUNKS = ("a", "b", "c")
BASE_FILES = [f"map-chunk-{chunk}.jpg" for chunk in CHUNKS]
PROGRESS_FILES = [
    f"map-progress-{chunk}-{stage}.png" for chunk in CHUNKS for stage in (1, 2, 3, 4)
]
HAZE_FILES = ["map-haze-left.png", "map-haze-right.png"]
GRAIN_FILE = "map-film-grain.png"
REQUIRED = BASE_FILES + PROGRESS_FILES + HAZE_FILES + [GRAIN_FILE]


def error(path: Path | None, message: str) -> str:
    label = path.name if path else "local-casino"
    return f"{label}: {message}"


def check_size(im: Image.Image, path: Path, errors: list[str]) -> None:
    if im.size != (WIDTH, HEIGHT):
        errors.append(error(path, f"expected {WIDTH}x{HEIGHT}, got {im.width}x{im.height}"))


def corners_transparent(im: Image.Image) -> bool:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    samples = ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))
    return all(rgba.getpixel(xy)[3] == 0 for xy in samples)


def meaningful_alpha(im: Image.Image) -> bool:
    alpha = im.getchannel("A")
    extrema = alpha.getextrema()
    if extrema is None:
        return False
    lo, hi = extrema
    return lo == 0 and hi > 0


def validate() -> list[str]:
    errors: list[str] = []

    if not ASSET_DIR.is_dir():
        return [error(None, f"missing asset directory {ASSET_DIR}")]

    present = {path.name for path in ASSET_DIR.iterdir() if path.is_file()}
    for name in REQUIRED:
        if name not in present:
            errors.append(error(ASSET_DIR / name, "missing required runtime file"))

    for name in BASE_FILES:
        path = ASSET_DIR / name
        if not path.is_file():
            continue
        with Image.open(path) as im:
            check_size(im, path, errors)
            if im.mode != "RGB":
                errors.append(error(path, f"base chunk must be RGB, got {im.mode}"))

    for name in PROGRESS_FILES + HAZE_FILES:
        path = ASSET_DIR / name
        if not path.is_file():
            continue
        with Image.open(path) as im:
            check_size(im, path, errors)
            if im.mode != "RGBA":
                errors.append(error(path, f"overlay/haze must be RGBA, got {im.mode}"))
                continue
            if not meaningful_alpha(im):
                errors.append(
                    error(path, "needs meaningful alpha (transparent empty area plus visible paint)")
                )
            if not corners_transparent(im):
                errors.append(error(path, "corners must be fully transparent"))

    grain = ASSET_DIR / GRAIN_FILE
    if grain.is_file():
        with Image.open(grain) as im:
            check_size(im, grain, errors)
            if im.mode not in {"RGB", "L"}:
                errors.append(error(grain, f"grain must be RGB or L, got {im.mode}"))

    expected = len(REQUIRED)
    found = sum(1 for name in REQUIRED if (ASSET_DIR / name).is_file())
    if found != expected:
        errors.append(
            error(None, f"expected {expected} runtime files, found {found}")
        )

    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("Local Casino asset check FAILED:")
        for item in errors:
            print(f"  - {item}")
        return 1
    print(f"Local Casino asset check passed ({len(REQUIRED)} runtime files).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
