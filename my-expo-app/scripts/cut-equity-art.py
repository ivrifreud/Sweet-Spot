"""Crop Equity Scale dial, character scale, and CTA buttons to transparent PNGs."""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path

from PIL import Image

ASSETS = Path(r"c:\Users\גיא\Sweet-Spot\my-expo-app\assets\tables\equity-scale")
SRC = Path(r"C:\Users\גיא\.cursor\projects\c-Users-Sweet-Spot\assets")


def clamp(v: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, v))


def first_existing(*parts: str) -> Path:
    for name in parts:
        p = SRC / name
        if p.exists():
            return p
        matches = list(SRC.glob(f"**/{Path(name).name}"))
        if matches:
            return matches[0]
    raise FileNotFoundError(parts)


def cut_circle(
    src: Path,
    dest: Path,
    *,
    skip,
    shrink: float,
) -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    def keep(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a < 16:
            return False
        return not skip(r, g, b, a)

    cx, cy = w / 2.0, h / 2.0
    rim: list[tuple[float, float]] = []
    for deg in range(0, 360, 2):
        rad = math.radians(deg)
        last = None
        for d in range(int(min(cx, cy))):
            x = int(cx + math.cos(rad) * d)
            y = int(cy + math.sin(rad) * d)
            if not (0 <= x < w and 0 <= y < h):
                break
            if keep(x, y):
                last = (x + 0.5, y + 0.5)
        if last:
            rim.append(last)

    cx = sum(p[0] for p in rim) / len(rim)
    cy = sum(p[1] for p in rim) / len(rim)
    radii = sorted(math.hypot(x - cx, y - cy) for x, y in rim)
    R = radii[len(radii) // 2] - shrink

    size = int(math.ceil(R * 2)) + 2
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    opx = out.load()
    ocx = ocy = (size - 1) / 2.0
    feather = 1.4
    for y in range(size):
        for x in range(size):
            sx = int(round(cx + (x - ocx)))
            sy = int(round(cy + (y - ocy)))
            dist = math.hypot(x - ocx, y - ocy)
            if dist > R or not (0 <= sx < w and 0 <= sy < h):
                continue
            r, g, b, a = px[sx, sy]
            if skip(r, g, b, a) or a < 16:
                continue
            alpha = 255 if dist <= R - feather else int(255 * (R - dist) / feather)
            opx[x, y] = (r, g, b, alpha)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    print(f"{dest.name} {out.size} R={R:.1f} center=({cx:.1f},{cy:.1f})")


def is_scale_backdrop(r: int, g: int, b: int) -> bool:
    if max(r, g, b) < 28:
        return False
    teal_wall = r < 60 and 70 < g < 110 and 65 < b < 110 and abs(g - b) < 18 and g > r + 20
    felt = g >= r + 6 and g > 62 and r < 165 and b < 155 and (g - r) >= 6
    horizon = 110 < r < 175 and 100 < g < 160 and 70 < b < 130 and abs(r - g) < 35
    return teal_wall or felt or horizon


def cut_scale(src: Path, dest: Path) -> None:
    """Border flood only. Hose arms are the same teal as the wall."""
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    keep = [[True] * w for _ in range(h)]
    seen = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        if seen[y][x]:
            return
        r, g, b, _a = px[x, y]
        if not is_scale_backdrop(r, g, b):
            return
        seen[y][x] = True
        keep[y][x] = False
        q.append((x, y))

    for x in range(w):
        enqueue(x, 0)
        enqueue(x, h - 1)
    for y in range(h):
        enqueue(0, y)
        enqueue(w - 1, y)

    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                enqueue(nx, ny)

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if not keep[y][x]:
                continue
            r, g, b, a = px[x, y]
            opx[x, y] = (r, g, b, a if a else 255)

    bbox = out.getbbox()
    if bbox:
        pad = 8
        l, t, r, b = bbox
        out = out.crop(
            (clamp(l - pad, 0, w), clamp(t - pad, 0, h), clamp(r + pad, 0, w), clamp(b + pad, 0, h))
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    print(f"{dest.name} {out.size}")


def cut_lock_in(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    for y in range(int(h * 0.16)):
        for x in range(int(w * 0.82), w):
            px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if bbox:
        pad = 2
        l, t, r, b = bbox
        im = im.crop(
            (clamp(l - pad, 0, w), clamp(t - pad, 0, h), clamp(r + pad, 0, w), clamp(b + pad, 0, h))
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    print(f"{dest.name} {im.size}")


def cut_fold(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size

    def is_checker(r: int, g: int, b: int, a: int) -> bool:
        mx, mn = max(r, g, b), min(r, g, b)
        return a < 16 or (mx - mn < 14 and 140 < mx < 230)

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_checker(r, g, b, a):
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if bbox:
        pad = 2
        l, t, r, b = bbox
        im = im.crop(
            (clamp(l - pad, 0, w), clamp(t - pad, 0, h), clamp(r + pad, 0, w), clamp(b + pad, 0, h))
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    print(f"{dest.name} {im.size}")


def main() -> None:
    disc = first_existing(
        "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_image-b34e927c-2862-436c-be5e-2937cd3aef99.jpg",
        "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_image-3684da56-6ed7-48fb-81a4-23c3b6b8f6bd.jpg",
    )
    scale = first_existing(
        "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_cartoon_scale-93f36a3a-71db-4185-bbcf-dc96fbee0298.jpg",
    )
    lock = first_existing(
        "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_image-fa41ea1b-703b-4257-a645-ffa3ad3164b7.png",
    )
    call = first_existing(
        "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_call_button-0c38e57d-66a7-4acf-9013-ba12d50a107f.jpg",
    )
    fold = first_existing(
        "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_fold_button-e5eefd7b-2059-41a8-a5ec-f0d5d44486dd.jpg",
    )

    def disc_skip(r: int, g: int, b: int, a: int) -> bool:
        return a > 8 and g > r + 12 and g > b + 4 and g > 55

    def call_skip(r: int, g: int, b: int, a: int) -> bool:
        return max(r, g, b) < 38

    cut_circle(disc, ASSETS / "scale-disc.png", skip=disc_skip, shrink=8)
    cut_scale(scale, ASSETS / "scale-character.png")
    cut_lock_in(lock, ASSETS / "button-lock-in.png")
    def fold_skip(r: int, g: int, b: int, a: int) -> bool:
        mx, mn = max(r, g, b), min(r, g, b)
        return mx - mn < 22 and mx > 170

    cut_circle(call, ASSETS / "button-call.png", skip=call_skip, shrink=2)
    cut_circle(fold, ASSETS / "button-fold.png", skip=fold_skip, shrink=2)
    recenter_rotary_dial(
        first_existing(
            "c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_30fd1d2a0cdfb9a052f82b32e9c17bd9_images_rotary-dial-a7d614a1-0173-46c9-bb9c-25ffe8ea77dc.png",
            str(ASSETS / "rotary-dial.png"),
        ),
        ASSETS / "rotary-dial.png",
    )


def is_hole_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return True
    if r > 228 and g > 228 and b > 228:
        return True
    return max(r, g, b) < 42


def fit_outer_circle(im: Image.Image) -> tuple[float, float, float]:
    w, h = im.size
    px = im.load()
    cx, cy = w / 2.0, h / 2.0
    rim: list[tuple[float, float]] = []
    for deg in range(0, 360, 1):
        rad = math.radians(deg)
        last = None
        for d in range(int(min(cx, cy)) + 8):
            x = int(round(cx + math.cos(rad) * d))
            y = int(round(cy + math.sin(rad) * d))
            if not (0 <= x < w and 0 <= y < h):
                break
            r, g, b, a = px[x, y]
            if a >= 16 and not is_hole_pixel(r, g, b, a):
                last = (x + 0.5, y + 0.5)
        if last:
            rim.append(last)
    ocx = sum(p[0] for p in rim) / len(rim)
    ocy = sum(p[1] for p in rim) / len(rim)
    radii = sorted(math.hypot(x - ocx, y - ocy) for x, y in rim)
    return ocx, ocy, radii[len(radii) // 2]


def recenter_rotary_dial(src: Path, dest: Path) -> None:
    """Center the wooden rim and punch a mathematically circular inner hole."""
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    ocx, ocy, outer_r = fit_outer_circle(im)

    inner_edges: list[float] = []
    for deg in range(360):
        rad = math.radians(deg)
        for d in range(1, int(outer_r * 0.7)):
            x = int(round(ocx + math.cos(rad) * d))
            y = int(round(ocy + math.sin(rad) * d))
            if not (0 <= x < w and 0 <= y < h):
                break
            r, g, b, a = px[x, y]
            if not is_hole_pixel(r, g, b, a):
                inner_edges.append(float(d))
                break

    gold_r = outer_r
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = math.hypot(x + 0.5 - ocx, y + 0.5 - ocy)
            if a >= 16 and r > 160 and g > 110 and b < 90 and dist < outer_r * 0.7:
                gold_r = min(gold_r, dist)

    # Must clear the farthest original hole, or leftover scallops stay in the opening.
    punch = min(max(inner_edges) + 2.0, gold_r - 7.0)
    lip = 3.2
    ink = (36, 32, 28, 255)
    size = int(math.ceil(outer_r * 2)) + 3
    if size % 2 == 0:
        size += 1
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    opx = out.load()
    cx = cy = size / 2.0
    feather = 0.85

    def sample(sx: float, sy: float) -> tuple[int, int, int, int] | None:
        ux = sx - ocx
        uy = sy - ocy
        span = math.hypot(ux, uy) or 1.0
        nx, ny = ux / span, uy / span
        for step in range(0, 28):
            x = int(round(sx + nx * step))
            y = int(round(sy + ny * step))
            if not (0 <= x < w and 0 <= y < h):
                return None
            r, g, b, a = px[x, y]
            if a >= 16 and not is_hole_pixel(r, g, b, a):
                return (r, g, b, a)
        return None

    def mask(dist: float, radius: float, inside: bool) -> float:
        if inside:
            if dist <= radius - feather:
                return 0.0
            if dist >= radius + feather:
                return 1.0
            return (dist - (radius - feather)) / (2.0 * feather)
        if dist >= radius + feather:
            return 0.0
        if dist <= radius - feather:
            return 1.0
        return (radius + feather - dist) / (2.0 * feather)

    for y in range(size):
        for x in range(size):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            dist = math.hypot(dx, dy)
            keep = mask(dist, punch, True) * mask(dist, outer_r, False)
            if keep <= 0:
                continue
            src_px = sample(ocx + dx, ocy + dy)
            if src_px is None:
                continue
            r, g, b, a = src_px
            if punch <= dist <= punch + lip:
                t = min(1.0, (punch + lip - dist) / lip)
                r = int(r * (1 - t) + ink[0] * t)
                g = int(g * (1 - t) + ink[1] * t)
                b = int(b * (1 - t) + ink[2] * t)
            opx[x, y] = (r, g, b, int(a * keep))

    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    print(
        f"{dest.name} {out.size} outer=({ocx:.2f},{ocy:.2f}) R={outer_r:.1f} "
        f"hole={punch:.1f} gold={gold_r:.1f} inner={min(inner_edges):.0f}-{max(inner_edges):.0f}"
    )


if __name__ == "__main__":
    main()
