"""Knock out paper and pin each dial-hand pose onto a 900x760 canvas."""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "tables" / "equity-scale"
RAW_DIR = ASSETS / "_raw"
CURSOR_ASSETS = Path.home() / ".cursor" / "projects" / "c-Users-Sweet-Spot" / "assets"

CANVAS_W, CANVAS_H = 900, 760
CONTACT_UV = (0.16, 0.36)
CONTACT_X = round(CANVAS_W * CONTACT_UV[0])
CONTACT_Y = round(CANVAS_H * CONTACT_UV[1])

# Open pinch (no cream ball). Motion is a small CSS tilt around the fingertip plant.
FRAMES = (("dial-hand-pinch-open-raw.png", "dial-hand-pinch.png"),)
REST_OUT = "dial-hand-pinch.png"


def cut_cream_paper(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    q = []

    def is_paper(r: int, g: int, b: int, a: int) -> bool:
        if a < 16:
            return True
        return r > 190 and g > 165 and b > 120 and abs(r - g) < 50

    def enqueue(x: int, y: int) -> None:
        if not (0 <= x < w and 0 <= y < h) or seen[y][x]:
            return
        if not is_paper(*px[x, y]):
            return
        seen[y][x] = True
        q.append((x, y))

    for x in range(w):
        enqueue(x, 0)
        enqueue(x, h - 1)
    for y in range(h):
        enqueue(0, y)
        enqueue(w - 1, y)
    i = 0
    while i < len(q):
        x, y = q[i]
        i += 1
        enqueue(x - 1, y)
        enqueue(x + 1, y)
        enqueue(x, y - 1)
        enqueue(x, y + 1)

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if seen[y][x]:
                continue
            r, g, b, a = px[x, y]
            opx[x, y] = (r, g, b, a if a else 255)
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def drop_small_blobs(im: Image.Image, min_area: int = 80) -> Image.Image:
    """Keep the glove; drop paper-tooth specks that steal the contact point."""
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    keep: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(w):
            if seen[y][x] or px[x, y][3] < 16:
                continue
            q = [(x, y)]
            seen[y][x] = True
            cells: list[tuple[int, int]] = []
            i = 0
            while i < len(q):
                cx, cy = q[i]
                i += 1
                cells.append((cx, cy))
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    xx, yy = cx + dx, cy + dy
                    if 0 <= xx < w and 0 <= yy < h and not seen[yy][xx] and px[xx, yy][3] >= 16:
                        seen[yy][xx] = True
                        q.append((xx, yy))
            if len(cells) >= min_area:
                keep.extend(cells)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for x, y in keep:
        opx[x, y] = px[x, y]
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def find_contact(im: Image.Image) -> tuple[float, float]:
    """Left edge of the glove, vertically centered so open/closed share a plant."""
    bbox = im.getbbox()
    if not bbox:
        w, h = im.size
        return (w * CONTACT_UV[0], h * CONTACT_UV[1])
    left, top, _right, bottom = bbox
    return (float(left), (top + bottom) / 2)


def fit_scale(cut: Image.Image, contact: tuple[float, float]) -> float:
    w, h = cut.size
    px, py = contact
    px = min(max(px, 1.0), w - 1)
    py = min(max(py, 1.0), h - 1)
    return max(
        0.15,
        min(
            CONTACT_X / px,
            CONTACT_Y / py,
            (CANVAS_W - CONTACT_X) / max(w - px, 1.0),
            (CANVAS_H - CONTACT_Y) / max(h - py, 1.0),
        )
        * 0.98,
    )


def place_on_canvas(cut: Image.Image, contact: tuple[float, float], scale: float) -> Image.Image:
    """Scale/pad so the fingertips land at DIAL_GLOVE_CONTACT on 900x760."""
    w, h = cut.size
    px, py = contact
    new_w = max(1, round(w * scale))
    new_h = max(1, round(h * scale))
    resized = cut.resize((new_w, new_h), Image.Resampling.LANCZOS)
    dest_x = round(CONTACT_X - px * scale)
    dest_y = round(CONTACT_Y - py * scale)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    sheet = Image.new("RGBA", (CANVAS_W + new_w, CANVAS_H + new_h), (0, 0, 0, 0))
    sheet.alpha_composite(resized, dest=(new_w, new_h))
    crop_l = new_w - dest_x
    crop_t = new_h - dest_y
    canvas.alpha_composite(sheet.crop((crop_l, crop_t, crop_l + CANVAS_W, crop_t + CANVAS_H)))
    return canvas


def resolve_raw(name: str) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    dest = RAW_DIR / name
    src = CURSOR_ASSETS / name
    if src.exists():
        shutil.copy2(src, dest)
        return dest
    if dest.exists():
        return dest
    raise FileNotFoundError(f"Missing raw frame {name}")


def prepare(raw: Path) -> tuple[Image.Image, tuple[float, float]]:
    cut = drop_small_blobs(cut_cream_paper(raw))
    return cut, find_contact(cut)


NAVY_SLEEVE = (12, 15, 20, 255)

# Keep in sync with DIAL_HAND_ATTACH_DEG / DIAL_HAND_WIDTH_SCALE in dialGloveLayout.ts
ATTACH_DEG = 8.0
WIDTH_SCALE = 1.15
DISC_R_UV = 0.5 / WIDTH_SCALE  # dial radius / hand width

# Index tip sits just outside a rim-planted disc; include it so it tucks behind the wheel.
INDEX_LOBE = [
    (150, 0),
    (400, 0),
    (410, 90),
    (320, 160),
    (200, 155),
    (150, 70),
    (150, 0),
]
GEN_TS = (
    Path(__file__).resolve().parents[1]
    / "src"
    / "features"
    / "templates"
    / "equity-scale"
    / "components"
    / "dialGloveDisc.generated.ts"
)


def disc_uv() -> tuple[float, float, float]:
    """Dial disc on the 900×760 canvas: right rim sits on CONTACT_UV."""
    rad = math.radians(ATTACH_DEG)
    cx = CONTACT_UV[0] - math.cos(rad) * DISC_R_UV
    cy = CONTACT_UV[1] - math.sin(rad) * DISC_R_UV * (CANVAS_W / CANVAS_H)
    return cx, cy, DISC_R_UV


def is_navy(p: tuple[int, int, int, int]) -> bool:
    r, g, b, a = p
    return a >= 16 and r < 45 and g < 50 and b < 55


def extend_sleeve(im: Image.Image) -> Image.Image:
    """Hose the navy cuff off the bottom-right corner of the canvas."""
    from PIL import ImageDraw

    w, h = im.size
    px = im.load()
    xs: list[int] = []
    ys: list[int] = []
    for y in range(h):
        for x in range(w):
            if is_navy(px[x, y]) and x > w * 0.58 and y > h * 0.54:
                xs.append(x)
                ys.append(y)
    if not xs:
        return im
    left, top, right, bottom = min(xs), min(ys), max(xs), max(ys)
    out = im.copy()
    ImageDraw.Draw(out).polygon(
        [
            (right - 2, top + 8),
            (w - 1, top + 28),
            (w - 1, h - 1),
            (left + 36, h - 1),
            (left + 8, bottom - 2),
            (right - 2, bottom - 2),
        ],
        fill=NAVY_SLEEVE,
    )
    return out


def disc_pixels(size: tuple[int, int]) -> tuple[int, int, int]:
    w, h = size
    cx_uv, cy_uv, r_uv = disc_uv()
    return round(cx_uv * w), round(cy_uv * h), round(r_uv * w)


def split_pinch_layers(pinch: Image.Image) -> tuple[Image.Image, Image.Image]:
    """Back = full hand. Front = hand minus (dial disc - thumb pad)."""
    from PIL import ImageChops, ImageDraw, ImageFilter

    w, h = pinch.size
    back = pinch.copy()
    cx, cy, r = disc_pixels((w, h))
    disc = Image.new("L", (w, h), 0)
    ImageDraw.Draw(disc).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    ImageDraw.Draw(disc).polygon(INDEX_LOBE, fill=255)
    tx, ty = int(w * CONTACT_UV[0]), int(h * CONTACT_UV[1])
    thumb = Image.new("L", (w, h), 0)
    ImageDraw.Draw(thumb).ellipse((tx - 55, ty - 52, tx + 58, ty + 42), fill=255)
    cut = ImageChops.subtract(disc, thumb)
    keep = Image.new("L", (w, h), 0)
    ImageDraw.Draw(keep).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    ImageDraw.Draw(keep).polygon(INDEX_LOBE, fill=255)
    cut = cut.filter(ImageFilter.GaussianBlur(1.6))
    cut = ImageChops.multiply(cut, keep)
    # Re-protect the thumb pad after the blur so the front keeps the grip.
    ImageDraw.Draw(cut).ellipse((tx - 48, ty - 46, tx + 50, ty + 36), fill=0)
    front = pinch.copy()
    r, g, b, a = front.split()
    front = Image.merge("RGBA", (r, g, b, ImageChops.subtract(a, cut)))
    return front, back


def assert_outside_cut_matches(front: Image.Image, back: Image.Image) -> None:
    """Pixels the cutter did not touch must be identical on front and back."""
    from PIL import ImageChops, ImageDraw, ImageFilter

    w, h = back.size
    cx, cy, r = disc_pixels((w, h))
    keep = Image.new("L", (w, h), 0)
    ImageDraw.Draw(keep).ellipse((cx - r - 6, cy - r - 6, cx + r + 6, cy + r + 6), fill=255)
    ImageDraw.Draw(keep).polygon(INDEX_LOBE, fill=255)
    keep = keep.filter(ImageFilter.MaxFilter(9))
    kp = keep.load()
    fp = front.load()
    bp = back.load()
    mismatches = 0
    for y in range(h):
        for x in range(w):
            if kp[x, y]:
                continue
            if fp[x, y] != bp[x, y]:
                mismatches += 1
                if mismatches > 8:
                    raise SystemExit(
                        f"front/back differ outside the cut ({mismatches}+ pixels)"
                    )
    if mismatches:
        raise SystemExit(f"front/back differ outside the cut ({mismatches} pixels)")


def write_disc_ts() -> None:
    cx, cy, r = disc_uv()
    GEN_TS.write_text(
        "/** Generated by scripts/cut-dial-hand-frames.py — do not edit. */\n"
        "export const DIAL_GLOVE_DISC = {\n"
        f"  x: {cx:.6f},\n"
        f"  y: {cy:.6f},\n"
        f"  r: {r:.6f},\n"
        "} as const;\n",
        encoding="utf-8",
    )


def write_hand_seam_check(pinch: Image.Image, front: Image.Image, back: Image.Image) -> None:
    """Visual check: back + gray dial stand-in + front should show no knuckle seam."""
    from PIL import ImageDraw

    debug = Path(__file__).resolve().parent / "_debug"
    debug.mkdir(exist_ok=True)
    w, h = pinch.size
    cx, cy, r = disc_pixels((w, h))
    dial = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(dial).ellipse((cx - r, cy - r, cx + r, cy + r), fill=(120, 120, 120, 255))
    comp = Image.new("RGBA", (w, h), (255, 0, 255, 255))
    comp.alpha_composite(back)
    comp.alpha_composite(dial)
    comp.alpha_composite(front)
    comp.save(debug / "hand-seam.png")


def regenerate_layers_from_pinch(pinch_path: Path) -> None:
    framed = Image.open(pinch_path).convert("RGBA")
    front, back = split_pinch_layers(framed)
    assert_outside_cut_matches(front, back)
    front.save(ASSETS / "dial-hand-pinch-front.png")
    back.save(ASSETS / "dial-hand-pinch-back.png")
    write_disc_ts()
    write_hand_seam_check(framed, front, back)
    print(f"regenerated layers from {pinch_path.name}")
    print(f"pinch-front bbox={front.getbbox()} pinch-back bbox={back.getbbox()}")


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    try:
        resolve_raw(FRAMES[0][0])
    except FileNotFoundError:
        existing = ASSETS / REST_OUT
        if not existing.exists():
            raise
        regenerate_layers_from_pinch(existing)
        return
    prepared: list[tuple[str, Image.Image, tuple[float, float]]] = []
    for raw_name, out_name in FRAMES:
        cut, contact = prepare(resolve_raw(raw_name))
        prepared.append((out_name, cut, contact))
    rest = next(item for item in prepared if item[0] == REST_OUT)
    scales = [fit_scale(cut, contact) for _, cut, contact in prepared]
    scale = min(scales)
    print(
        f"shared scale={scale:.4f} rest_scale={fit_scale(rest[1], rest[2]):.4f} "
        f"target=({CONTACT_X},{CONTACT_Y}) scales={[round(s, 4) for s in scales]}"
    )
    for out_name, cut, contact in prepared:
        framed = extend_sleeve(place_on_canvas(cut, contact, scale))
        framed.save(ASSETS / out_name)
        print(
            f"{out_name} bbox={framed.getbbox()} contact_src=({contact[0]:.1f},{contact[1]:.1f})"
        )
        if out_name == REST_OUT:
            front, back = split_pinch_layers(framed)
            assert_outside_cut_matches(front, back)
            front.save(ASSETS / "dial-hand-pinch-front.png")
            back.save(ASSETS / "dial-hand-pinch-back.png")
            write_disc_ts()
            write_hand_seam_check(framed, front, back)
            print(f"pinch-front bbox={front.getbbox()} pinch-back bbox={back.getbbox()}")


if __name__ == "__main__":
    main()
