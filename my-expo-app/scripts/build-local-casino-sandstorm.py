"""Build top-band Local Casino sandstorm plates with a soft center join."""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
GARDEN = ROOT / "assets" / "themes" / "bennys-garden"
CASINO = ROOT / "assets" / "themes" / "local-casino"

DUST = (199, 165, 106)
TOBACCO = (118, 83, 55)
CREAM = (232, 215, 167)
SIZE = (576, 1024)


def recolor_cloud(src: Image.Image) -> Image.Image:
    im = src.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            luma = (r + g + b) / 3
            if b > r + 8 and g >= r:
                color = TOBACCO
                alpha = min(255, int(a * 1.2))
            elif luma > 170:
                color = CREAM
                alpha = min(255, int(a * 1.12))
            else:
                color = DUST
                alpha = min(255, int(a * 1.18))
            px[x, y] = (*color, alpha)
    return im


def stamp(dst: Image.Image, cloud: Image.Image, xy: tuple[int, int], scale: float) -> None:
    w = max(32, int(cloud.width * scale))
    h = max(32, int(cloud.height * scale))
    layer = cloud.resize((w, h), Image.Resampling.LANCZOS)
    dst.alpha_composite(layer, xy)


def fade_inner(im: Image.Image, from_left: bool) -> Image.Image:
    """Keep this bank on its own side so the join is a puff, not a vertical cut."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            t = x / (w - 1)
            if from_left:
                keep_x = 1.0 if t < 0.4 else max(0.0, (1.0 - t) / 0.6)
            else:
                keep_x = 1.0 if t > 0.6 else max(0.0, t / 0.6)
            y_t = y / (h - 1)
            keep_y = 1.0 if y_t < 0.05 else max(0.0, 1.0 - (y_t - 0.05) / 0.14)
            px[x, y] = (r, g, b, int(a * keep_x * keep_y))
    return out


def build_side(garden_path: Path, inner_is_right: bool) -> Image.Image:
    cloud = recolor_cloud(Image.open(garden_path))
    canvas = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    if inner_is_right:
        placements = [
            (-140, -210, 1.28),
            (-40, -150, 1.12),
            (-20, -130, 1.08),
            (80, -160, 1.06),
            (140, -90, 0.95),
            (40, -50, 0.88),
            (-70, -20, 0.9),
        ]
    else:
        placements = [
            (80, -210, 1.28),
            (20, -150, 1.12),
            (-20, -130, 1.08),
            (-120, -160, 1.06),
            (-160, -90, 0.95),
            (-40, -50, 0.88),
            (40, -20, 0.9),
        ]
    for x, y, scale in placements:
        stamp(canvas, cloud, (x, y), scale)
    canvas = fade_inner(canvas, from_left=inner_is_right)
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=1.6))
    for cx, cy in ((0, 0), (SIZE[0] - 1, 0), (0, SIZE[1] - 1), (SIZE[0] - 1, SIZE[1] - 1)):
        canvas.putpixel((cx, cy), (0, 0, 0, 0))
    return canvas


def main() -> None:
    left = build_side(GARDEN / "fog-clouds-left.png", inner_is_right=True)
    right = build_side(GARDEN / "fog-clouds-right.png", inner_is_right=False)
    left.save(CASINO / "map-haze-left.png", "PNG")
    right.save(CASINO / "map-haze-right.png", "PNG")
    print("wrote", CASINO / "map-haze-left.png", left.size)
    print("wrote", CASINO / "map-haze-right.png", right.size)


if __name__ == "__main__":
    main()
