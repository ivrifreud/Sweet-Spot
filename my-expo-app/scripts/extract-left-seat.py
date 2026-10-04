#!/usr/bin/env python3
"""Cut the painted left player off each Hot Seats table plate.

Writes two 571x1024 RGBA layers per skin into assets/hot-seats/:

- <skin>-left-seat.png   only the left figure (hat, coat, gloves, two card backs)
- <skin>-left-fill.png   the plate with that figure painted out

At rest, fill + cutout composite back to the exact plate pixels, so the swap
can start and end on the shipped painting.

The matte is the flat-black silhouette grown from a seed on the head, joined by
the gloves and card backs, ringed with its anti-aliased outline, and
hole-filled inside a hand-drawn fence. The fence and the gap polygons stop it
from taking rose outlines, leaves, and the table rail.

Usage:
    python my-expo-app/scripts/extract-left-seat.py
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parent.parent / "assets" / "hot-seats"
PLATES = {
    "garden": ASSETS / "bennys-garden.png",
    "casino": ASSETS / "local-casino.jpg",
}

# Art pixels on the 571x1024 plate: x0, y0, x1, y1 (exclusive).
CROP = (0, 134, 196, 448)
HEAD_SEED = (90, 270)
# Fence hugging the figure, clockwise from the hat crown. Both plates share the blocking.
FENCE = [
    (74, 191), (132, 191), (141, 212), (153, 226), (153, 249), (137, 256),
    (137, 295), (150, 316), (168, 336), (175, 360), (172, 383), (161, 397),
    (147, 399), (133, 406), (125, 419), (72, 419), (60, 413), (40, 408),
    (22, 402), (9, 396), (5, 370), (9, 340), (19, 313), (35, 297), (55, 292),
    (51, 272), (49, 250), (47, 230), (59, 220), (69, 212),
]
# Background the figure encloses: leaves right of the tie, and the rail
# between the torso and the forearm.
GAPS = [
    [(106, 305), (125, 300), (147, 321), (153, 336), (104, 336)],
    [(48, 368), (94, 366), (94, 392), (48, 396)],
]
# Gloves and card backs sit inside this box. Felt and rail stay outside it.
HANDS = (66, 334, 172, 418)
# The coat, hat, and head are flat black. Leaf and branch outlines are dark but not black.
SOLID_MAX = 48
# Anti-aliased outline pixels within RING of the body join it.
INK_MAX = 130
RING = 2
DILATE = 1
FILL_BLUR_PASSES = 3


def neighbors4(x: int, y: int):
    yield x + 1, y
    yield x - 1, y
    yield x, y + 1
    yield x, y - 1


def neighbors8(x: int, y: int):
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx or dy:
                yield x + dx, y + dy


def build_matte(plate: Image.Image) -> set[tuple[int, int]]:
    px = plate.load()
    x0, y0, x1, y1 = CROP
    fence_img = Image.new("L", plate.size, 0)
    ImageDraw.Draw(fence_img).polygon(FENCE, fill=255)
    fence = fence_img.load()

    def inside(x: int, y: int) -> bool:
        return x0 <= x < x1 and y0 <= y < y1 and fence[x, y] > 0

    def ink(x: int, y: int) -> bool:
        r, g, b = px[x, y][:3]
        return r + g + b <= INK_MAX

    def solid(x: int, y: int) -> bool:
        r, g, b = px[x, y][:3]
        return r + g + b <= SOLID_MAX

    hx0, hy0, hx1, hy1 = HANDS

    def hand(x: int, y: int) -> bool:
        if not (hx0 <= x < hx1 and hy0 <= y < hy1):
            return False
        r, g, b = px[x, y][:3]
        glove = r >= 190 and g >= 170 and b >= 120 and g <= r + 5
        card = 145 <= r <= 210 and 115 <= g <= 185 and 85 <= b <= 160 and r > b + 15
        return glove or card

    if not solid(*HEAD_SEED):
        raise SystemExit(f"Head seed {HEAD_SEED} is not solid ink; re-measure the plate.")

    gap_img = Image.new("L", plate.size, 0)
    for gap in GAPS:
        ImageDraw.Draw(gap_img).polygon(gap, fill=255)
    gaps = gap_img.load()

    def in_gap(x: int, y: int) -> bool:
        return 0 <= x < plate.width and 0 <= y < plate.height and gaps[x, y] > 0

    core: set[tuple[int, int]] = set()
    queue = deque([HEAD_SEED])
    core.add(HEAD_SEED)
    while queue:
        x, y = queue.popleft()
        for nx, ny in neighbors4(x, y):
            if (nx, ny) not in core and inside(nx, ny) and (solid(nx, ny) or hand(nx, ny)):
                core.add((nx, ny))
                queue.append((nx, ny))

    figure = set(core)
    edge = set(core)
    for _ in range(RING):
        edge = {
            n
            for c in edge
            for n in neighbors8(*c)
            if n not in figure and inside(*n) and not in_gap(*n) and ink(*n)
        }
        figure |= edge

    # Everything the outside can reach without crossing the figure is background.
    # Gap pixels are background too, but they do not flood past their polygon.
    outside: set[tuple[int, int]] = set()
    queue = deque()
    for y in range(y0 - 1, y1 + 1):
        for x in range(x0 - 1, x1 + 1):
            if (x, y) in figure:
                continue
            if in_gap(x, y):
                outside.add((x, y))
            elif not inside(x, y):
                outside.add((x, y))
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for nx, ny in neighbors4(x, y):
            if (
                x0 - 1 <= nx <= x1
                and y0 - 1 <= ny <= y1
                and (nx, ny) not in outside
                and (nx, ny) not in figure
            ):
                outside.add((nx, ny))
                queue.append((nx, ny))

    matte = {
        (x, y)
        for y in range(y0, y1)
        for x in range(x0, x1)
        if inside(x, y) and (x, y) not in outside
    }
    return grow(matte, DILATE, inside)


def grow(cells: set[tuple[int, int]], radius: int, inside) -> set[tuple[int, int]]:
    for _ in range(radius):
        ring = {
            n for c in cells for n in neighbors8(*c) if n not in cells and inside(*n)
        }
        cells = cells | ring
    return cells


def cut_figure(plate: Image.Image, matte: set[tuple[int, int]]) -> Image.Image:
    src = plate.load()
    out = Image.new("RGBA", plate.size, (0, 0, 0, 0))
    dst = out.load()
    for x, y in matte:
        dst[x, y] = src[x, y]
    return out


def paint_out(plate: Image.Image, matte: set[tuple[int, int]]) -> Image.Image:
    """Onion-peel the hole from its rim inward, each pixel the mean of its known neighbors."""
    out = plate.copy()
    dst = out.load()
    unknown = set(matte)
    width, height = plate.size
    while unknown:
        layer = []
        for x, y in unknown:
            known = [
                dst[nx, ny]
                for nx, ny in neighbors8(x, y)
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in unknown
            ]
            if known:
                layer.append(((x, y), known))
        if not layer:
            raise SystemExit("Fill stalled; the matte has no rim.")
        for (x, y), known in layer:
            dst[x, y] = tuple(sum(p[i] for p in known) // len(known) for i in range(4))
        unknown.difference_update(cell for cell, _ in layer)

    # Soften the peel streaks. Only hole pixels change, so the rest of the plate stays exact.
    for _ in range(FILL_BLUR_PASSES):
        blurred = {}
        for x, y in matte:
            window = [
                dst[nx, ny]
                for ny in range(y - 2, y + 3)
                for nx in range(x - 2, x + 3)
                if 0 <= nx < width and 0 <= ny < height
            ]
            blurred[(x, y)] = tuple(sum(p[i] for p in window) // len(window) for i in range(4))
        for cell, value in blurred.items():
            dst[cell] = value
    return out


def main() -> None:
    for skin, path in PLATES.items():
        plate = Image.open(path).convert("RGBA")
        if plate.size != (571, 1024):
            raise SystemExit(f"{path.name} is {plate.size}, expected 571x1024.")
        matte = build_matte(plate)
        xs = [x for x, _ in matte]
        ys = [y for _, y in matte]
        cut_figure(plate, matte).save(ASSETS / f"{skin}-left-seat.png", optimize=True)
        paint_out(plate, matte).save(ASSETS / f"{skin}-left-fill.png", optimize=True)
        print(
            f"{skin}: {len(matte)} px, box x {min(xs)}-{max(xs)}, y {min(ys)}-{max(ys)}"
        )


if __name__ == "__main__":
    main()
