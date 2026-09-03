#!/usr/bin/env python3
"""Turn a magenta-backed chip render into a trimmed, transparent sprite.

The chip sprites are generated on a solid #FF00FF field so the background can be
keyed out losslessly. Magenta is safe for this palette: the chip's brick red
(~#B5493C) has a low blue channel, so it never matches the key test.

Usage:
    python my-expo-app/scripts/key-chip-sprite.py IN.png OUT.png [--max-size 512]
    python my-expo-app/scripts/key-chip-sprite.py IN.png OUT.png --check-only
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

# A pixel is background when it is bright in red+blue and dark in green.
KEY_R_MIN = 170
KEY_B_MIN = 170
KEY_G_MAX_RATIO = 0.72
# Feather band: partially-keyed pixels get proportional alpha so edges stay soft.
FEATHER = 46


def magenta_score(r: int, g: int, b: int) -> float:
    """0.0 = fully opaque chip, 1.0 = fully background."""
    if r < KEY_R_MIN or b < KEY_B_MIN:
        return 0.0
    rb = min(r, b)
    if g > rb * KEY_G_MAX_RATIO:
        return 0.0
    # How far below the green ceiling the pixel sits, normalised by the feather.
    ceiling = rb * KEY_G_MAX_RATIO
    depth = ceiling - g
    return min(1.0, depth / FEATHER)


def despill(r: int, g: int, b: int) -> tuple[int, int, int]:
    """Remove magenta fringe bleeding into the chip's ink outline."""
    limit = g + FEATHER
    return min(r, limit), g, min(b, limit)


def key_image(src: Image.Image) -> Image.Image:
    rgb = src.convert("RGB")
    out = Image.new("RGBA", rgb.size)
    src_px = rgb.load()
    out_px = out.load()
    width, height = rgb.size

    for y in range(height):
        for x in range(width):
            r, g, b = src_px[x, y]
            score = magenta_score(r, g, b)
            if score >= 1.0:
                out_px[x, y] = (0, 0, 0, 0)
                continue
            alpha = int(round((1.0 - score) * 255))
            if score > 0.0:
                r, g, b = despill(r, g, b)
            out_px[x, y] = (r, g, b, alpha)

    return out


def trim(img: Image.Image, pad: int = 2) -> Image.Image:
    bbox = img.split()[3].getbbox()
    if bbox is None:
        raise SystemExit("error: keyed image is fully transparent")
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(img.width, right + pad)
    bottom = min(img.height, bottom + pad)
    return img.crop((left, top, right, bottom))


def inset(img: Image.Image, amount: int) -> Image.Image:
    """Shave feathered rows/columns off the border.

    The stack edge slice is rendered flush against its neighbours, so any
    semi-transparent border row would show as a light seam between chips.
    """
    if amount <= 0:
        return img
    return img.crop((amount, amount, img.width - amount, img.height - amount))


def fit(img: Image.Image, max_size: int) -> Image.Image:
    if max(img.size) <= max_size:
        return img
    scale = max_size / max(img.size)
    size = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
    return img.resize(size, Image.LANCZOS)


def report(img: Image.Image, label: str) -> None:
    alpha = img.split()[3]
    total = img.width * img.height
    hist = alpha.histogram()
    transparent = hist[0]
    opaque = hist[255]
    partial = total - transparent - opaque
    corners = [
        alpha.getpixel((0, 0)),
        alpha.getpixel((img.width - 1, 0)),
        alpha.getpixel((0, img.height - 1)),
        alpha.getpixel((img.width - 1, img.height - 1)),
    ]
    print(f"{label}: {img.width}x{img.height} mode={img.mode}")
    print(
        f"  alpha: {transparent / total:.1%} clear, "
        f"{opaque / total:.1%} solid, {partial / total:.1%} feathered"
    )
    print(f"  corner alpha: {corners}")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("dest", type=Path, nargs="?")
    parser.add_argument("--max-size", type=int, default=512)
    parser.add_argument("--pad", type=int, default=2)
    parser.add_argument(
        "--inset",
        type=int,
        default=0,
        help="Shave N border pixels after trimming, for sprites that tile flush.",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Report the alpha channel of an existing PNG and exit.",
    )
    args = parser.parse_args(argv)

    if args.check_only:
        report(Image.open(args.source).convert("RGBA"), str(args.source))
        return 0

    if args.dest is None:
        parser.error("dest is required unless --check-only is passed")

    keyed = fit(
        inset(trim(key_image(Image.open(args.source)), args.pad), args.inset),
        args.max_size,
    )
    args.dest.parent.mkdir(parents=True, exist_ok=True)
    keyed.save(args.dest, "PNG", optimize=True)
    report(keyed, str(args.dest))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
