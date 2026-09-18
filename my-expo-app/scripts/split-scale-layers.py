"""Split the equity-scale character into aligned body / arm PNG layers."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "tables" / "equity-scale"
SRC = ASSETS / "scale-character.png"

CABINET_LEFT = 330
CABINET_RIGHT = 750
BEAM_LEFT = 310
BEAM_RIGHT = 760
BEAM_BOTTOM = 222
SHOULDER_Y = 230


def is_teal_hose(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return False
    return g > r + 10 and 40 < g < 160 and r < 100 and b > 40


def is_glove(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return False
    return r > 170 and g > 140 and b > 90 and r >= g - 8 and g > b + 8


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


def add_right_chips(src: Image.Image, right_arm: Image.Image) -> None:
    chips_src = Path(r"C:\Users\גיא\.cursor\projects\c-Users-Sweet-Spot\assets\scale-right-chips.png")
    if chips_src.exists():
        chips = cut_cream_paper(chips_src)
        chips.thumbnail((148, 128))
        dest_x = src.size[0] - 62 - chips.size[0]
        dest_y = 398
        right_arm.alpha_composite(chips, dest=(dest_x, dest_y))
        return
    chips = src.crop((48, 392, 214, 538))
    px = chips.load()
    cw, ch = chips.size
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = px[x, y]
            if a < 40 or is_teal_hose(r, g, b, a) or is_glove(r, g, b, a) or r < 90 or g < 45:
                px[x, y] = (0, 0, 0, 0)
    chips = chips.transpose(Image.FLIP_LEFT_RIGHT)
    right_arm.alpha_composite(chips, dest=(src.size[0] - 214 - 40, 400))


def overpaint_shoulders(body: Image.Image, left_arm: Image.Image, right_arm: Image.Image) -> None:
    """Hide socket seams: wood on the cabinet, teal caps on the hose ends."""
    body_px = body.load()
    wood = (92, 55, 36, 255)
    # Clone inward wood over leftover hose ink.
    for x0, x1, inward in ((310, 430, 24), (640, 760, -24)):
        for y in range(240, 400):
            for x in range(x0, x1):
                r, g, b, a = body_px[x, y]
                if a < 16:
                    continue
                if max(r, g, b) < 80 or is_teal_hose(r, g, b, a):
                    sx = min(body.size[0] - 1, max(0, x + inward))
                    sample = body_px[sx, y]
                    body_px[x, y] = sample if sample[3] >= 16 else wood

    draw_body = ImageDraw.Draw(body)
    draw_left = ImageDraw.Draw(left_arm)
    draw_right = ImageDraw.Draw(right_arm)
    teal = (47, 107, 108, 255)
    left_socket = (388, 310)
    right_socket = (680, 310)
    draw_body.ellipse(
        (left_socket[0] - 14, left_socket[1] - 16, left_socket[0] + 10, left_socket[1] + 16),
        fill=wood,
    )
    draw_body.ellipse(
        (right_socket[0] - 10, right_socket[1] - 16, right_socket[0] + 14, right_socket[1] + 16),
        fill=wood,
    )
    draw_left.ellipse(
        (left_socket[0] - 18, left_socket[1] - 14, left_socket[0] + 18, left_socket[1] + 14),
        fill=teal,
    )
    draw_right.ellipse(
        (right_socket[0] - 18, right_socket[1] - 14, right_socket[0] + 18, right_socket[1] + 14),
        fill=teal,
    )
    # Drop leftover hose strokes that still poke past the cabinet silhouette.
    for y in range(248, 378):
        for x in range(310, 370):
            body_px[x, y] = (0, 0, 0, 0)
        for x in range(700, 760):
            body_px[x, y] = (0, 0, 0, 0)


def zero_corners(layer: Image.Image) -> None:
    w, h = layer.size
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        layer.putpixel((x, y), (0, 0, 0, 0))


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
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

    left_layer = copy_masked(src, left_arm)
    right_layer = copy_masked(src, right_arm)
    body_layer = copy_masked(src, body)

    for layer in (body_layer, left_layer, right_layer):
        zero_corners(layer)

    body_path = ASSETS / "scale-body.png"
    left_path = ASSETS / "scale-left-arm.png"
    right_path = ASSETS / "scale-right-arm.png"
    body_layer.save(body_path)
    left_layer.save(left_path)
    right_layer.save(right_path)

    print(f"{body_path.name} bbox={body_layer.getbbox()}")
    print(f"{left_path.name} bbox={left_layer.getbbox()}")
    print(f"{right_path.name} bbox={right_layer.getbbox()}")


if __name__ == "__main__":
    main()
