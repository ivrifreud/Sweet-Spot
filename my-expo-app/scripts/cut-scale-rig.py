"""Cut the scale painting into a live rig: body, two hoses, two pans.

The app rotates each hose around its shoulder collar and slides each pan with
the glove ring, so this script only has to separate the layers once and record
where the pivots and rings sit on the shared 1197x998 padded canvas.
"""
from __future__ import annotations

import math
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

APP = Path(__file__).resolve().parents[1]
ASSETS = APP / "assets" / "tables" / "equity-scale"
LAYOUT_TS = (
    APP / "src" / "features" / "templates" / "equity-scale" / "components"
    / "scaleRigLayout.generated.ts"
)
DEBUG = Path(__file__).resolve().parent / "_debug"

SRC_W, SRC_H = 1069, 698
PAD_X, PAD_Y = 64, 150
CANVAS_W, CANVAS_H = SRC_W + 2 * PAD_X, SRC_H + 2 * PAD_Y
CHARACTER = ASSETS / "scale-character.png"
MAX_TILT = 28

CABINET_LEFT, CABINET_RIGHT = 330, 750
BEAM_LEFT, BEAM_RIGHT, BEAM_BOTTOM = 310, 760, 222
SHOULDER_Y = 218
HOSE, GLOVE, PAN, OUT = 1, 2, 3, 4
NEIGHBORS = ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1))

# Brass shoulder collars measured on the painting: centre x, centre y, semi-axis x, semi-axis y.
# The centre is the hose pivot.
COLLARS = {"left": (401.0, 298.0, 14, 47), "right": (667.0, 284.0, 17, 37)}
COLLAR_INK = 4
# Hose paint under a collar is clipped to this radius so a rotated root never leaves it.
ROOT_RADIUS = 38
# Source px boxes left/right of each collar lip that hold only hose paint.
SHOULDER_GAPS = {"left": (CABINET_LEFT, 240, 384, 340), "right": (688, 236, CABINET_RIGHT + 1, 318)}
# Pan paint must sit inside a cone hanging from the holding ring (source px).
PAN_CONE_BASE = 30
PAN_CONE_SLOPE = 0.8
# How far the hose tube is extended into the body, past its painted end.
ROOT_EXTENSION = 14
ROOT_HALF_SPAN = 34


def is_teal_hose(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return False
    return g > r + 10 and 40 < g < 160 and r < 100 and b > 40


def is_glove(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return False
    return r > 170 and g > 140 and b > 90 and r >= g - 8 and g > b + 8


def is_gold_ring(r: int, g: int, b: int, a: int) -> bool:
    if a < 16 or is_glove(r, g, b, a) or is_teal_hose(r, g, b, a):
        return False
    return r > 150 and 90 < g < 170 and b < 90 and r > g + 15


def is_chain(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return False
    return (90 < r < 170 and 40 < g < 120 and b < 80 and r > g + 10) or is_gold_ring(r, g, b, a)


def is_hose_like(r: int, g: int, b: int, a: int) -> bool:
    if a < 16 or is_glove(r, g, b, a):
        return False
    if is_teal_hose(r, g, b, a):
        return True
    return g > r + 4 and 30 < g < 180 and r < 120 and b > 30


def is_gold_hardware(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
    if p[3] < 16 or y > BEAM_BOTTOM or x < BEAM_LEFT or x > BEAM_RIGHT:
        return False
    return not is_teal_hose(*p)


def is_cabinet(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
    if p[3] < 16 or y < SHOULDER_Y or x < CABINET_LEFT or x > CABINET_RIGHT:
        return False
    return not is_teal_hose(*p)


def copy_masked(src: Image.Image, predicate) -> Image.Image:
    w, h = src.size
    px = src.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if predicate(x, y, p):
                opx[x, y] = p
    return out


def in_shoulder_gap(side: str, x: int, y: int) -> bool:
    """Between the cabinet edge and the collar lip everything painted is hose (fill + outline)."""
    x0, y0, x1, y1 = SHOULDER_GAPS[side]
    return x0 <= x < x1 and y0 <= y < y1


def split_character(src: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    mid = src.size[0] / 2

    def left_arm(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
        if p[3] < 16 or is_gold_hardware(x, y, p):
            return False
        if in_shoulder_gap("left", x, y):
            return True
        return x < CABINET_LEFT or (x < mid and is_teal_hose(*p))

    def right_arm(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
        if p[3] < 16 or is_gold_hardware(x, y, p):
            return False
        if in_shoulder_gap("right", x, y):
            return True
        return x > CABINET_RIGHT or (x > mid and is_teal_hose(*p))

    def body(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
        return p[3] >= 16 and (is_gold_hardware(x, y, p) or is_cabinet(x, y, p))

    return copy_masked(src, body), copy_masked(src, left_arm), copy_masked(src, right_arm)


def flood(seed: list[list[bool]], expand, w: int, h: int) -> None:
    q: deque[tuple[int, int]] = deque((x, y) for y in range(h) for x in range(w) if seed[y][x])
    while q:
        x, y = q.popleft()
        for dx, dy in NEIGHBORS:
            xx, yy = x + dx, y + dy
            if 0 <= xx < w and 0 <= yy < h and not seed[yy][xx] and expand(xx, yy):
                seed[yy][xx] = True
                q.append((xx, yy))


def erase_where(dst: Image.Image, mask: Image.Image) -> None:
    dpx, mpx = dst.load(), mask.load()
    w, h = dst.size
    for y in range(h):
        for x in range(w):
            if mpx[x, y][3] >= 16:
                dpx[x, y] = (0, 0, 0, 0)


def longest_run(xs: list[int]) -> tuple[int, int] | None:
    if not xs:
        return None
    xs = sorted(xs)
    best_a = best_b = run_a = prev = xs[0]
    for x in xs[1:]:
        if x <= prev + 3:
            prev = x
            continue
        if prev - run_a > best_b - best_a:
            best_a, best_b = run_a, prev
        run_a = prev = x
    if prev - run_a > best_b - best_a:
        best_a, best_b = run_a, prev
    return (best_a, best_b)


def clean_shoulder_ink(body: Image.Image) -> None:
    """Drop thin leftover hose strokes that stick out of the cabinet."""
    w, h = body.size
    px = body.load()
    mid = w // 2
    for y in range(190, min(420, h)):
        left = [x for x in range(mid) if px[x, y][3] >= 16]
        right = [x for x in range(mid, w) if px[x, y][3] >= 16]
        for xs in (left, right):
            run = longest_run(xs)
            if not run:
                continue
            keep_l, keep_r = run
            for x in xs:
                if x < keep_l - 1 or x > keep_r + 1:
                    px[x, y] = (0, 0, 0, 0)


def drop_tiny_specks(im: Image.Image, min_area: int = 40) -> None:
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if seen[y][x] or px[x, y][3] < 16:
                continue
            q = [(x, y)]
            seen[y][x] = True
            i = 0
            while i < len(q):
                cx, cy = q[i]
                i += 1
                for dx, dy in NEIGHBORS:
                    xx, yy = cx + dx, cy + dy
                    if 0 <= xx < w and 0 <= yy < h and not seen[yy][xx] and px[xx, yy][3] >= 16:
                        seen[yy][xx] = True
                        q.append((xx, yy))
            if len(q) < min_area:
                for cx, cy in q:
                    px[cx, cy] = (0, 0, 0, 0)


def largest_glove_bottom(im: Image.Image) -> int:
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    best_n, best_bottom = 0, -1
    for y in range(h):
        for x in range(w):
            if seen[y][x] or not is_glove(*px[x, y]):
                continue
            q = [(x, y)]
            seen[y][x] = True
            bottom = y
            i = 0
            while i < len(q):
                cx, cy = q[i]
                i += 1
                bottom = max(bottom, cy)
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    xx, yy = cx + dx, cy + dy
                    if 0 <= xx < w and 0 <= yy < h and not seen[yy][xx] and is_glove(*px[xx, yy]):
                        seen[yy][xx] = True
                        q.append((xx, yy))
            if len(q) > best_n:
                best_n, best_bottom = len(q), bottom
    return best_bottom


def label_arm(arm: Image.Image) -> list[list[int]]:
    w, h = arm.size
    px = arm.load()
    hose = [[is_teal_hose(*px[x, y]) for x in range(w)] for y in range(h)]
    flood(hose, lambda x, y: is_hose_like(*px[x, y]), w, h)
    glove = [[y < 330 and is_glove(*px[x, y]) for x in range(w)] for y in range(h)]
    flood(glove, lambda x, y: y < 360 and is_glove(*px[x, y]), w, h)

    labels = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 16:
                continue
            if hose[y][x]:
                labels[y][x] = HOSE
            elif glove[y][x]:
                labels[y][x] = GLOVE
            elif max(r, g, b) < 80 or a < 200 or max(r, g, b) - min(r, g, b) < 28:
                labels[y][x] = OUT
            else:
                labels[y][x] = PAN
    # Ink outlines take the label of the nearest painted region (multi-source BFS).
    q: deque[tuple[int, int]] = deque(
        (x, y) for y in range(h) for x in range(w) if labels[y][x] in (HOSE, GLOVE, PAN)
    )
    while q:
        x, y = q.popleft()
        for dx, dy in NEIGHBORS:
            xx, yy = x + dx, y + dy
            if 0 <= xx < w and 0 <= yy < h and labels[yy][xx] == OUT:
                labels[yy][xx] = labels[y][x]
                q.append((xx, yy))
    for y in range(h):
        for x in range(w):
            if labels[y][x] == OUT:
                labels[y][x] = PAN
    return labels


def find_ring(pan: Image.Image, bowl_top: int) -> tuple[float, float]:
    """Top of the holding ring / chain bundle under the glove."""
    w, h = pan.size
    px = pan.load()
    pts = [
        (x, y)
        for y in range(min(bowl_top, h))
        for x in range(w)
        if is_gold_ring(*px[x, y])
    ]
    if not pts:
        pts = [
            (x, y)
            for y in range(min(bowl_top, h))
            for x in range(w)
            if px[x, y][3] >= 16 and 60 < px[x, y][0] < 160 and 30 < px[x, y][1] < 110
            and px[x, y][2] < 80
        ]
    if not pts:
        return (w / 2, float(bowl_top))
    y_top = min(p[1] for p in pts)
    keep = [p for p in pts if p[1] <= y_top + 14]
    return (sum(p[0] for p in keep) / len(keep), sum(p[1] for p in keep) / len(keep))


def split_arm(arm: Image.Image) -> tuple[Image.Image, Image.Image, tuple[float, float]]:
    """Hose + glove + holding ring move together; chains, bowl, chips hang upright."""
    w, h = arm.size
    px = arm.load()
    labels = label_arm(arm)
    chains = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cpx = chains.load()
    for y in range(h):
        for x in range(w):
            if labels[y][x] == PAN:
                cpx[x, y] = px[x, y]
    rx, ry = find_ring(chains, 380)
    # Chains fan out below the ring into the bowl; pan paint outside that cone is hose ink.
    for y in range(h):
        for x in range(w):
            if labels[y][x] != PAN:
                continue
            if y < ry - 12 or abs(x - rx) > PAN_CONE_BASE + (y - ry) * PAN_CONE_SLOPE:
                labels[y][x] = HOSE
    hose = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pan = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hpx, ppx = hose.load(), pan.load()
    for y in range(h):
        for x in range(w):
            if labels[y][x] in (HOSE, GLOVE):
                hpx[x, y] = px[x, y]
            elif labels[y][x] == PAN:
                ppx[x, y] = px[x, y]

    glove_bottom = largest_glove_bottom(hose)
    ring_x = find_ring(pan, 380)[0]
    # Glove shading / ink the colour tests missed rides with the glove; chains stay on the pan.
    for y in range(min(glove_bottom, h)):
        for x in range(w):
            p = ppx[x, y]
            if p[3] < 16 or (y > glove_bottom - 40 and is_chain(*p)):
                continue
            hpx[x, y] = p
            ppx[x, y] = (0, 0, 0, 0)
    # Non-hose paint under the glove, in the chain column, goes back to the pan (never erased).
    for y in range(max(glove_bottom + 1, 0), h):
        for x in range(max(0, int(ring_x) - 90), min(w, int(ring_x) + 90)):
            p = hpx[x, y]
            if p[3] < 16 or is_hose_like(*p):
                continue
            if max(p[:3]) < 80 and any(
                0 <= x + dx < w and 0 <= y + dy < h and is_teal_hose(*hpx[x + dx, y + dy])
                for dx, dy in NEIGHBORS
            ):
                continue
            ppx[x, y] = p
            hpx[x, y] = (0, 0, 0, 0)

    ring = find_ring(pan, 380)
    cx, cy = int(round(ring[0])), int(round(ring[1]))
    for y in range(max(0, cy - 16), min(h, cy + 17)):
        for x in range(max(0, cx - 16), min(w, cx + 17)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= 256 and is_gold_ring(*ppx[x, y]):
                hpx[x, y] = ppx[x, y]
                ppx[x, y] = (0, 0, 0, 0)
    drop_tiny_specks(hose)
    drop_tiny_specks(pan, 40)
    return hose, pan, ring


def outside_collar(side: str, x: int, y: int, grow: int) -> bool:
    cx, cy, ax, ay = COLLARS[side]
    return ((x - cx) / (ax + grow)) ** 2 + ((y - cy) / (ay + grow)) ** 2 > 1


def clean_collar_whiskers(body: Image.Image, arms: dict[str, Image.Image]) -> None:
    """Hose outline stubs left on the outer side of each collar ride nowhere; drop them.

    Only rows the hose occupies where it meets the collar, so the cabinet outline
    above and below each collar stays intact.
    """
    px = body.load()
    for side, (cx, cy, ax, ay) in COLLARS.items():
        outward = -1 if side == "left" else 1
        gap = SHOULDER_GAPS[side]
        col = gap[2] - 1 if side == "left" else gap[0]
        apx = arms[side].load()
        rows = [y for y in range(gap[1], gap[3]) if apx[col, y][3] >= 16]
        if not rows:
            continue
        for y in range(min(rows) - 5, max(rows) + 6):
            for i in range(0, int(ax) + COLLAR_INK + 14):
                x = int(cx) + outward * i
                if outside_collar(side, x, y, COLLAR_INK):
                    px[x, y] = (0, 0, 0, 0)


def clip_root(hose: Image.Image, side: str, pivot: tuple[float, float]) -> None:
    """Paint under the collar must stay within ROOT_RADIUS so rotation keeps it covered."""
    w, h = hose.size
    px = hose.load()
    cx, cy = pivot
    for y in range(h):
        for x in range(w):
            under = x > cx - COLLARS[side][2] if side == "left" else x < cx + COLLARS[side][2]
            if under and px[x, y][3] and (x - cx) ** 2 + (y - cy) ** 2 > ROOT_RADIUS ** 2:
                px[x, y] = (0, 0, 0, 0)


def extend_root(hose: Image.Image, side: str, pivot: tuple[float, float]) -> None:
    """Smear the painted tube end into the body so it stays under the collar when rotated."""
    w, h = hose.size
    px = hose.load()
    _, py = pivot
    step = 1 if side == "left" else -1
    for y in range(int(py) - ROOT_HALF_SPAN, int(py) + ROOT_HALF_SPAN):
        if not 0 <= y < h:
            continue
        xs = [x for x in range(w) if px[x, y][3] >= 16]
        if not xs:
            continue
        end = max(xs) if side == "left" else min(xs)
        if abs(end - pivot[0]) > 30:
            continue
        colour = px[end - step, y] if px[end - step, y][3] >= 200 else px[end, y]
        for i in range(1, ROOT_EXTENSION + 1):
            x = end + step * i
            if 0 <= x < w:
                px[x, y] = colour


def pad_layer(im: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    out.alpha_composite(im, (PAD_X, PAD_Y))
    return out


def crop_box(im: Image.Image) -> tuple[int, int, int, int]:
    l, t, r, b = im.getbbox()
    return (max(0, l - 2), max(0, t - 2), min(CANVAS_W, r + 2), min(CANVAS_H, b + 2))


def css_rotate_point(x: float, y: float, pivot: tuple[float, float], deg: float):
    cx, cy = pivot
    t = math.radians(deg)
    dx, dy = x - cx, y - cy
    return (cx + dx * math.cos(t) - dy * math.sin(t), cy + dx * math.sin(t) + dy * math.cos(t))


def pose(layers: dict, tilt: float) -> Image.Image:
    frame = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 0, 255, 255))
    for side in ("left", "right"):
        ring, pivot = layers[side]["ring"], layers[side]["pivot"]
        rx, ry = css_rotate_point(*ring, pivot, tilt)
        pan = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        pan.paste(layers[side]["pan"], (int(round(rx - ring[0])), int(round(ry - ring[1]))))
        frame.alpha_composite(pan)
    for side in ("left", "right"):
        hose = layers[side]["hose"].rotate(
            -tilt, center=layers[side]["pivot"], resample=Image.Resampling.BICUBIC
        )
        frame.alpha_composite(hose)
    frame.alpha_composite(layers["body"])
    d = ImageDraw.Draw(frame)
    for side in ("left", "right"):
        x, y = layers[side]["pivot"]
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(255, 0, 0, 255))
    return frame


def check_chains(pan: Image.Image, ring: tuple[float, float], side: str) -> None:
    px = pan.load()
    w, _ = pan.size
    for y in range(int(ring[1]) + 20, int(ring[1]) + 80):
        if not any(px[x, y][3] >= 16 for x in range(w)):
            raise SystemExit(f"{side} pan has an empty row at y={y}: chains are cut")


def fmt(v: float) -> str:
    return f"{v:.1f}".rstrip("0").rstrip(".")


def main() -> None:
    src = Image.open(CHARACTER).convert("RGBA")
    if src.size != (SRC_W, SRC_H):
        raise SystemExit(f"{CHARACTER.name} is {src.size}, expected {(SRC_W, SRC_H)}")
    body, left_arm, right_arm = split_character(src)
    erase_where(body, left_arm)
    erase_where(body, right_arm)
    clean_shoulder_ink(body)
    clean_collar_whiskers(body, {"left": left_arm, "right": right_arm})
    drop_tiny_specks(body, 60)

    layers: dict = {"body": pad_layer(body)}
    for side, arm in (("left", left_arm), ("right", right_arm)):
        hose, pan, ring = split_arm(arm)
        pivot = COLLARS[side][:2]
        extend_root(hose, side, pivot)
        clip_root(hose, side, pivot)
        check_chains(pan, ring, side)
        layers[side] = {
            "hose": pad_layer(hose),
            "pan": pad_layer(pan),
            "ring": (ring[0] + PAD_X, ring[1] + PAD_Y),
            "pivot": (pivot[0] + PAD_X, pivot[1] + PAD_Y),
        }
        print(f"{side}: pivot={pivot} ring={ring} hose={hose.getbbox()} pan={pan.getbbox()}")

    names = {
        "body": ("scale-rig-body.png", layers["body"]),
        "hoseLeft": ("scale-rig-hose-left.png", layers["left"]["hose"]),
        "hoseRight": ("scale-rig-hose-right.png", layers["right"]["hose"]),
        "panLeft": ("scale-rig-pan-left.png", layers["left"]["pan"]),
        "panRight": ("scale-rig-pan-right.png", layers["right"]["pan"]),
    }
    boxes = {}
    for key, (file_name, im) in names.items():
        box = crop_box(im)
        im.crop(box).save(ASSETS / file_name, optimize=True)
        boxes[key] = box
        print(f"{file_name} box={box}")

    lines = [
        "// Generated by scripts/cut-scale-rig.py. Canvas px in the 1197x998 padded space.",
        "export const SCALE_RIG_LAYERS = {",
    ]
    for key, (l, t, r, b) in boxes.items():
        lines.append(f"  {key}: {{ x: {l}, y: {t}, w: {r - l}, h: {b - t} }},")
    lines.append("} as const;")
    for const, field in (("SCALE_RIG_PIVOTS", "pivot"), ("SCALE_RIG_RINGS", "ring")):
        lx, ly = layers["left"][field]
        rx, ry = layers["right"][field]
        lines.append(
            f"export const {const} = {{\n  left: {{ x: {fmt(lx)}, y: {fmt(ly)} }},\n"
            f"  right: {{ x: {fmt(rx)}, y: {fmt(ry)} }},\n}} as const;"
        )
    LAYOUT_TS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    DEBUG.mkdir(exist_ok=True)
    frames = [pose(layers, t) for t in (-MAX_TILT, 0, MAX_TILT)]
    sheet = Image.new("RGBA", (CANVAS_W * 3, CANVAS_H))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * CANVAS_W, 0))
    sheet.resize((sheet.width // 2, sheet.height // 2), Image.Resampling.LANCZOS).save(
        DEBUG / "rig-overlay.png"
    )
    for side in ("left", "right"):
        x, y = layers[side]["pivot"]
        box = (int(x) - 110, int(y) - 110, int(x) + 110, int(y) + 110)
        strip = Image.new("RGBA", (660, 220))
        for i, f in enumerate(frames):
            strip.paste(f.crop(box), (i * 220, 0))
        strip.resize((1320, 440), Image.Resampling.NEAREST).save(DEBUG / f"rig-joint-{side}.png")
    print("ok")


if __name__ == "__main__":
    sys.exit(main())
