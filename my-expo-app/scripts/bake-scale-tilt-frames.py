"""Bake 2-degree arm-only tilt frames from the original scale painting."""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "tables" / "equity-scale"

SRC_W, SRC_H = 1069, 698
PAD_X, PAD_Y = 64, 150
CANVAS_W, CANVAS_H = SRC_W + 2 * PAD_X, SRC_H + 2 * PAD_Y
BODY_SLOT = "scale-body-slot.png"

PIVOTS = {"left": (400 + PAD_X, 300 + PAD_Y), "right": (672 + PAD_X, 300 + PAD_Y)}


def tilt_name(deg: int) -> str:
    if deg == 0:
        return "scale-frame-000.png"
    side = "l" if deg < 0 else "r"
    return f"scale-frame-{side}{abs(deg):02d}.png"


TILTS = tuple((deg, tilt_name(deg)) for deg in range(-28, 29, 2))
CHARACTER = ASSETS / "scale-character.png"
CABINET_LEFT, CABINET_RIGHT = 330, 750
BEAM_LEFT, BEAM_RIGHT, BEAM_BOTTOM = 310, 760, 222
SHOULDER_Y = 218
HOSE, GLOVE, PAN, OUT = 1, 2, 3, 4
NEIGHBORS = (
    (-1, 0),
    (1, 0),
    (0, -1),
    (0, 1),
    (-1, -1),
    (1, -1),
    (-1, 1),
    (1, 1),
)


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


def is_gold_hardware(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
    r, g, b, a = p
    if a < 16 or y > BEAM_BOTTOM:
        return False
    if x < BEAM_LEFT or x > BEAM_RIGHT:
        return False
    if is_teal_hose(r, g, b, a):
        return False
    return True


def is_cabinet(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
    r, g, b, a = p
    if a < 16 or y < SHOULDER_Y:
        return False
    if x < CABINET_LEFT or x > CABINET_RIGHT:
        return False
    if is_teal_hose(r, g, b, a):
        return False
    return True


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


def split_character(src: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    """Cut body / arms from the original painting. No chips, no socket overpaint."""
    w = src.size[0]
    mid = w / 2

    def left_arm(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
        r, g, b, a = p
        if a < 16 or is_gold_hardware(x, y, p):
            return False
        if x < CABINET_LEFT:
            return True
        return x < mid and is_teal_hose(r, g, b, a)

    def right_arm(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
        r, g, b, a = p
        if a < 16 or is_gold_hardware(x, y, p):
            return False
        if x > CABINET_RIGHT:
            return True
        return x > mid and is_teal_hose(r, g, b, a)

    def body(x: int, y: int, p: tuple[int, int, int, int]) -> bool:
        if p[3] < 16:
            return False
        return is_gold_hardware(x, y, p) or is_cabinet(x, y, p)

    return copy_masked(src, body), copy_masked(src, left_arm), copy_masked(src, right_arm)
    if a < 16 or is_glove(r, g, b, a):
        return False
    if is_teal_hose(r, g, b, a):
        return True
    return g > r + 4 and 30 < g < 180 and r < 120 and b > 30


def flood(seed_mask: list[list[bool]], expand, w: int, h: int) -> None:
    q: deque[tuple[int, int]] = deque(
        (x, y) for y in range(h) for x in range(w) if seed_mask[y][x]
    )
    while q:
        x, y = q.popleft()
        for dx, dy in NEIGHBORS:
            xx, yy = x + dx, y + dy
            if 0 <= xx < w and 0 <= yy < h and not seed_mask[yy][xx] and expand(xx, yy):
                seed_mask[yy][xx] = True
                q.append((xx, yy))


def is_hose_like(r: int, g: int, b: int, a: int) -> bool:
    if a < 16 or is_glove(r, g, b, a):
        return False
    if is_teal_hose(r, g, b, a):
        return True
    return g > r + 4 and 30 < g < 180 and r < 120 and b > 30


def split_arm(arm: Image.Image) -> tuple[Image.Image, Image.Image]:
    w, h = arm.size
    px = arm.load()
    hose = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if is_teal_hose(*px[x, y]):
                hose[y][x] = True
    flood(hose, lambda x, y: is_hose_like(*px[x, y]), w, h)

    glove = [[False] * w for _ in range(h)]
    # Chip faces share the cream predicate; they live in the bowls below y~350.
    for y in range(min(h, 330)):
        for x in range(w):
            if is_glove(*px[x, y]):
                glove[y][x] = True
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
            elif max(r, g, b) < 80:
                labels[y][x] = OUT
            else:
                labels[y][x] = PAN
    for y in range(h):
        for x in range(w):
            if labels[y][x] != OUT:
                continue
            counts = {HOSE: 0, GLOVE: 0, PAN: 0}
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < w and 0 <= yy < h and labels[yy][xx] in counts:
                        counts[labels[yy][xx]] += 1
            winner = max(counts, key=counts.get)
            if counts[HOSE] + counts[GLOVE] >= counts[PAN]:
                winner = HOSE if counts[HOSE] >= counts[GLOVE] else GLOVE
            elif not counts[winner]:
                winner = PAN
            labels[y][x] = winner

    hose_glove = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pan = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hpx, ppx = hose_glove.load(), pan.load()
    for y in range(h):
        for x in range(w):
            if labels[y][x] in (HOSE, GLOVE):
                hpx[x, y] = px[x, y]
            elif labels[y][x] == PAN:
                ppx[x, y] = px[x, y]
    rehome_stray_pan(hose_glove, pan)
    return hose_glove, pan


def rehome_stray_pan(hose: Image.Image, pan: Image.Image) -> None:
    """Keep original chains and bowls on the pan; leftover glove ink rides with the hose."""
    w, h = pan.size
    hpx, ppx = hose.load(), pan.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = ppx[x, y]
            if a < 16:
                continue
            if y >= 350:
                continue
            if y > 230 and (
                (90 < r < 170 and 40 < g < 120 and b < 80 and r > g + 10)
                or (r > 150 and 90 < g < 170 and b < 90 and r > g + 15)
            ):
                continue
            hpx[x, y] = (r, g, b, a)
            ppx[x, y] = (0, 0, 0, 0)


def find_ring(pan: Image.Image, bowl_top: int) -> tuple[float, float]:
    """Top of the original chain / holding ring, not a mid-chain blob."""
    w, h = pan.size
    px = pan.load()
    gold_x: list[int] = []
    gold_y: list[int] = []
    for y in range(min(bowl_top, h)):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 16:
                continue
            if r > 150 and 90 < g < 170 and b < 90 and r > g + 15:
                gold_x.append(x)
                gold_y.append(y)
    if gold_x:
        y_top = min(gold_y)
        keep = [(x, y) for x, y in zip(gold_x, gold_y) if y <= y_top + 14]
        return (
            sum(p[0] for p in keep) / len(keep),
            sum(p[1] for p in keep) / len(keep),
        )
    chain_y: list[int] = []
    chain_x: list[int] = []
    for y in range(min(bowl_top, h)):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 16 or max(r, g, b) < 40:
                continue
            if 60 < r < 160 and 30 < g < 110 and b < 80:
                chain_x.append(x)
                chain_y.append(y)
    if chain_y:
        y_top = min(chain_y)
        keep = [(x, y) for x, y in zip(chain_x, chain_y) if y <= y_top + 12]
        return (
            sum(p[0] for p in keep) / len(keep),
            sum(p[1] for p in keep) / len(keep),
        )
    return (w / 2, float(bowl_top))


def transfer_ring(
    hose: Image.Image, pan: Image.Image, ring: tuple[float, float], radius: int = 16
) -> None:
    """Keep only the gold holding ring on the rotating glove. Chains stay on the pan."""
    hpx, ppx = hose.load(), pan.load()
    cx, cy = int(round(ring[0])), int(round(ring[1]))
    w, h = pan.size
    r2 = radius * radius
    for y in range(max(0, cy - radius), min(h, cy + radius + 1)):
        for x in range(max(0, cx - radius), min(w, cx + radius + 1)):
            if (x - cx) ** 2 + (y - cy) ** 2 > r2:
                continue
            r, g, b, a = ppx[x, y]
            if not is_gold_ring(r, g, b, a):
                continue
            hpx[x, y] = (r, g, b, a)
            ppx[x, y] = (0, 0, 0, 0)


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


def bowl_rim_points(bowl: Image.Image) -> list[tuple[int, int]]:
    bbox = bowl.getbbox()
    if not bbox:
        return []
    l, t, r, b = bbox
    px = bowl.load()
    for y in range(t, b):
        xs = [x for x in range(l, r) if px[x, y][3] >= 16]
        run = longest_run(xs)
        if not run:
            continue
        x0, x1 = run
        if 90 <= x1 - x0 <= 280:
            return [(x0 + 8, y), ((x0 + x1) // 2, y), (x1 - 8, y)]
    return []


def rotate_css(im: Image.Image, css_deg: float, pivot: tuple[int, int]) -> Image.Image:
    return im.rotate(-css_deg, center=pivot, resample=Image.Resampling.BICUBIC)


def css_rotate_point(
    x: float, y: float, pivot: tuple[int, int], css_deg: float
) -> tuple[float, float]:
    """Match PIL Image.rotate(-css_deg) around pivot on a Y-down canvas."""
    cx, cy = pivot
    t = math.radians(css_deg)
    dx, dy = x - cx, y - cy
    return (
        cx + dx * math.cos(t) - dy * math.sin(t),
        cy + dx * math.sin(t) + dy * math.cos(t),
    )


def largest_glove_bottom(im: Image.Image) -> int:
    """Bottom of the real glove, ignoring cream sparkles on chain links."""
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    best_n = 0
    best_bottom = -1
    for y in range(h):
        for x in range(w):
            if seen[y][x] or not is_glove(*px[x, y]):
                continue
            q = [(x, y)]
            seen[y][x] = True
            n = 0
            bottom = y
            i = 0
            while i < len(q):
                cx, cy = q[i]
                i += 1
                n += 1
                if cy > bottom:
                    bottom = cy
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    xx, yy = cx + dx, cy + dy
                    if 0 <= xx < w and 0 <= yy < h and not seen[yy][xx] and is_glove(*px[xx, yy]):
                        seen[yy][xx] = True
                        q.append((xx, yy))
            if n > best_n:
                best_n = n
                best_bottom = bottom
    return best_bottom


def erase_chain_ink(im: Image.Image) -> None:
    """Chains hang from the glove; they must not rotate with the hose."""
    w, h = im.size
    px = im.load()
    glove_bottom = largest_glove_bottom(im)
    if glove_bottom < 0:
        return
    for y in range(glove_bottom + 1, h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 16:
                continue
            if is_teal_hose(r, g, b, a) or is_hose_like(r, g, b, a):
                continue
            if max(r, g, b) < 80:
                near_teal = False
                for dx, dy in NEIGHBORS:
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < w and 0 <= yy < h and is_teal_hose(*px[xx, yy]):
                        near_teal = True
                        break
                if near_teal:
                    continue
            px[x, y] = (0, 0, 0, 0)


def drop_tiny_specks(im: Image.Image, min_area: int = 40) -> None:
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    keep: set[tuple[int, int]] = set()
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
                for dx, dy in NEIGHBORS:
                    xx, yy = cx + dx, cy + dy
                    if 0 <= xx < w and 0 <= yy < h and not seen[yy][xx] and px[xx, yy][3] >= 16:
                        seen[yy][xx] = True
                        q.append((xx, yy))
            if len(cells) >= min_area:
                keep.update(cells)
    for y in range(h):
        for x in range(w):
            if px[x, y][3] >= 16 and (x, y) not in keep:
                px[x, y] = (0, 0, 0, 0)


def translate(im: Image.Image, dx: int, dy: int) -> Image.Image:
    if dx == 0 and dy == 0:
        return im.copy()
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out


def translate_y(im: Image.Image, dy: int) -> Image.Image:
    return translate(im, 0, dy)


def erase_where(dst: Image.Image, mask: Image.Image) -> None:
    dpx, mpx = dst.load(), mask.load()
    w, h = dst.size
    for y in range(h):
        for x in range(w):
            if mpx[x, y][3] >= 16:
                dpx[x, y] = (0, 0, 0, 0)


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


def pad_layer(im: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    out.alpha_composite(im, (PAD_X, PAD_Y))
    return out
    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    out.alpha_composite(im, (PAD_X, PAD_Y))
    return out
    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    out.alpha_composite(im, (PAD_X, PAD_Y))
    return out


def main() -> None:
    src = Image.open(CHARACTER).convert("RGBA")
    if src.size != (SRC_W, SRC_H):
        raise SystemExit(f"{CHARACTER.name} is {src.size}, expected {(SRC_W, SRC_H)}")
    body, left_arm, right_arm = split_character(src)
    erase_where(body, left_arm)
    erase_where(body, right_arm)
    clean_shoulder_ink(body)
    pad_layer(body).save(ASSETS / BODY_SLOT)

    layers = {}
    for side, arm in (("left", left_arm), ("right", right_arm)):
        hose, pan = split_arm(arm)
        ring = find_ring(pan, 380)
        transfer_ring(hose, pan, ring)
        erase_chain_ink(hose)
        drop_tiny_specks(hose)
        drop_tiny_specks(pan)
        layers[side] = {
            "hose": pad_layer(hose),
            "pan": pad_layer(pan),
            "ring": (ring[0] + PAD_X, ring[1] + PAD_Y),
        }
        print(
            f"{side} hose={hose.getbbox()} pan={pan.getbbox()} "
            f"ring=({ring[0]:.1f},{ring[1]:.1f})"
        )
        if ring[1] < 200:
            raise SystemExit(f"{side} ring Y {ring[1]:.1f} is the hose crown, not the glove")

    size = (CANVAS_W, CANVAS_H)
    for tilt, name in TILTS:
        frame = Image.new("RGBA", size, (0, 0, 0, 0))
        for side in ("left", "right"):
            pivot = PIVOTS[side]
            hose = rotate_css(layers[side]["hose"], tilt, pivot)
            ring = layers[side]["ring"]
            rx, ry = css_rotate_point(ring[0], ring[1], pivot, tilt)
            dx = int(round(rx - ring[0]))
            dy = int(round(ry - ring[1]))
            pan = translate(layers[side]["pan"], dx, dy)
            frame.alpha_composite(hose)
            frame.alpha_composite(pan)
            print(f"  {name} {side} tilt={tilt} dx={dx} dy={dy}")
        bbox = frame.getbbox()
        if bbox and (bbox[0] <= 0 or bbox[1] <= 0 or bbox[2] >= CANVAS_W or bbox[3] >= CANVAS_H):
            raise SystemExit(f"{name} still clips the padded canvas: {bbox} size={size}")
        frame.save(ASSETS / name)
        print(f"{name} bbox={bbox} size={frame.size} (original chains, padded)")


if __name__ == "__main__":
    main()
