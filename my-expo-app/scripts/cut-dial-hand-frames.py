"""Knock out paper and pin each dial-hand pose onto a 900x760 canvas."""
from __future__ import annotations

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

# Full index digit on the 900x760 canvas. Tucks behind the wheel.
PINCH_BACK_INDEX = [
    (188, 2),
    (155, 18),
    (140, 52),
    (138, 95),
    (152, 140),
    (195, 168),
    (255, 175),
    (320, 162),
    (375, 130),
    (410, 88),
    (418, 42),
    (395, 8),
    (340, 2),
    (250, 0),
    (188, 2),
]


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


def split_pinch_layers(pinch: Image.Image) -> tuple[Image.Image, Image.Image]:
    """Index tucks behind the wheel; thumb stays in front and plants on the rim."""
    from PIL import ImageChops, ImageDraw, ImageFilter

    w, h = pinch.size
    rgb = pinch.convert("RGB")
    src_a = pinch.getchannel("A")
    index = Image.new("L", (w, h), 0)
    ImageDraw.Draw(index).polygon(PINCH_BACK_INDEX, fill=255)
    index = index.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(1.4))
    front = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    front.paste(rgb, mask=ImageChops.subtract(src_a, index))
    back = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    back.paste(rgb, mask=ImageChops.multiply(src_a, index))
    return front, back


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
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
            front.save(ASSETS / "dial-hand-pinch-front.png")
            back.save(ASSETS / "dial-hand-pinch-back.png")
            print(f"pinch-front bbox={front.getbbox()} pinch-back bbox={back.getbbox()}")


if __name__ == "__main__":
    main()
