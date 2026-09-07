"""Generate transparent, layered Equity Scale production sprites.

The supplied JPG sheets are composition references only. These sprites are
purpose-built with stable pivots and no baked labels so React Native can animate
the beam, pans, hatches, dial, lamps, and glove poses independently.
"""

from pathlib import Path
from random import Random

from PIL import Image, ImageDraw

SCALE = 3
OUT = Path(__file__).resolve().parents[1] / "my-expo-app/assets/tables/equity-scale"

INK = "#171713"
CREAM = "#E8D7A7"
GOLD = "#C89B3C"
GOLD_BRIGHT = "#E6C46A"
TOBACCO = "#765337"
WOOD_LIGHT = "#9A6B43"
WOOD_DARK = "#513521"
PROJECTOR = "#111714"


def canvas(width: int, height: int):
    image = Image.new("RGBA", (width * SCALE, height * SCALE), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


def box(values):
    return tuple(round(value * SCALE) for value in values)


def points(values):
    return [(round(x * SCALE), round(y * SCALE)) for x, y in values]


def line(draw, values, fill=INK, width=5):
    draw.line(points(values), fill=fill, width=width * SCALE, joint="curve")


def finish(image: Image.Image, name: str):
    OUT.mkdir(parents=True, exist_ok=True)
    image.resize(
        (image.width // SCALE, image.height // SCALE), Image.Resampling.LANCZOS
    ).save(OUT / name, optimize=True)


def wood_grain(draw, areas, seed):
    rng = Random(seed)
    for x1, y1, x2, y2 in areas:
        for _ in range(7):
            y = rng.uniform(y1 + 5, y2 - 5)
            x = rng.uniform(x1 + 8, x2 - 28)
            length = rng.uniform(14, min(70, x2 - x))
            line(
                draw,
                [(x, y), (x + length * 0.45, y - 1.5), (x + length, y + 0.5)],
                fill="#604027",
                width=1,
            )


def scale_base():
    image, draw = canvas(520, 330)
    draw.rounded_rectangle(box((42, 268, 478, 310)), radius=14 * SCALE, fill=WOOD_DARK, outline=INK, width=6 * SCALE)
    draw.polygon(points([(55, 246), (465, 246), (484, 279), (36, 279)]), fill=TOBACCO, outline=INK)
    line(draw, [(49, 253), (466, 253)], fill=WOOD_LIGHT, width=4)
    draw.ellipse(box((64, 296, 119, 324)), fill=WOOD_DARK, outline=INK, width=5 * SCALE)
    draw.ellipse(box((401, 296, 456, 324)), fill=WOOD_DARK, outline=INK, width=5 * SCALE)
    draw.polygon(points([(204, 247), (222, 107), (298, 107), (316, 247)]), fill=TOBACCO, outline=INK)
    draw.polygon(points([(224, 239), (238, 125), (282, 125), (296, 239)]), fill=WOOD_LIGHT)
    line(draw, [(224, 239), (238, 125), (282, 125), (296, 239)], width=5)
    draw.ellipse(box((226, 80, 294, 148)), fill=WOOD_DARK, outline=INK, width=6 * SCALE)
    draw.ellipse(box((239, 93, 281, 135)), fill=GOLD, outline=INK, width=5 * SCALE)
    line(draw, [(248, 123), (272, 101)], width=4)
    draw.polygon(points([(247, 81), (249, 28), (260, 12), (271, 28), (273, 81)]), fill=GOLD, outline=INK)
    draw.polygon(points([(253, 31), (260, 20), (267, 31), (266, 76), (254, 76)]), fill=CREAM)
    line(draw, [(247, 81), (249, 28), (260, 12), (271, 28), (273, 81)], width=5)
    wood_grain(draw, [(55, 246, 465, 279), (224, 126, 296, 239)], 11)
    finish(image, "scale-base.png")


def scale_beam():
    image, draw = canvas(660, 160)
    beam = [(38, 60), (105, 91), (225, 88), (330, 61), (435, 88), (555, 91), (622, 60)]
    line(draw, beam, fill=INK, width=26)
    line(draw, beam, fill=GOLD, width=16)
    line(draw, [(52, 61), (110, 83), (226, 80), (330, 55)], fill=GOLD_BRIGHT, width=3)
    line(draw, [(330, 55), (434, 80), (550, 83), (608, 61)], fill=WOOD_LIGHT, width=4)
    for x in (37, 623):
        draw.rounded_rectangle(box((x - 13, 43, x + 13, 78)), radius=4 * SCALE, fill=GOLD, outline=INK, width=5 * SCALE)
        draw.rectangle(box((x - 4, 74, x + 4, 122)), fill=GOLD, outline=INK, width=3 * SCALE)
    draw.ellipse(box((302, 31, 358, 87)), fill=TOBACCO, outline=INK, width=6 * SCALE)
    draw.ellipse(box((315, 44, 345, 74)), fill=GOLD, outline=INK, width=4 * SCALE)
    finish(image, "scale-beam.png")


def scale_pan():
    image, draw = canvas(240, 120)
    draw.ellipse(box((19, 24, 221, 82)), fill=WOOD_DARK, outline=INK, width=5 * SCALE)
    draw.pieslice(box((22, 23, 218, 111)), 0, 180, fill=GOLD, outline=INK, width=5 * SCALE)
    draw.ellipse(box((29, 28, 211, 75)), fill="#B77B39", outline=INK, width=4 * SCALE)
    draw.arc(box((42, 37, 198, 68)), 180, 355, fill=GOLD_BRIGHT, width=3 * SCALE)
    draw.rounded_rectangle(box((108, 88, 132, 116)), radius=4 * SCALE, fill=GOLD, outline=INK, width=4 * SCALE)
    finish(image, "scale-pan.png")


def hatch():
    image, draw = canvas(250, 115)
    draw.polygon(points([(20, 30), (224, 20), (236, 78), (31, 92)]), fill=TOBACCO, outline=INK)
    line(draw, [(30, 35), (222, 26)], fill=WOOD_LIGHT, width=4)
    wood_grain(draw, [(30, 29, 224, 84)], 19)
    finish(image, "pit-hatch-closed.png")


def pit():
    image, draw = canvas(250, 115)
    draw.polygon(points([(18, 30), (222, 22), (239, 92), (30, 101)]), fill=TOBACCO, outline=INK)
    draw.polygon(points([(34, 42), (210, 36), (222, 80), (43, 87)]), fill=PROJECTOR, outline=INK)
    draw.polygon(points([(43, 50), (203, 45), (213, 77), (49, 81)]), fill="#060907")
    finish(image, "pit-open.png")


def dial():
    image, draw = canvas(300, 300)
    draw.ellipse(box((12, 12, 288, 288)), fill=CREAM, outline=INK, width=8 * SCALE)
    draw.ellipse(box((31, 31, 269, 269)), fill="#D9C38C", outline=TOBACCO, width=4 * SCALE)
    for index in range(21):
        angle = (225 + index * 270 / 20) * 3.141592653589793 / 180
        import math
        outer = 122
        inner = 109 if index % 5 else 101
        cx = cy = 150
        line(
            draw,
            [
                (cx + math.cos(angle) * inner, cy + math.sin(angle) * inner),
                (cx + math.cos(angle) * outer, cy + math.sin(angle) * outer),
            ],
            width=3 if index % 5 else 5,
        )
    draw.polygon(points([(141, 5), (159, 5), (150, 25)]), fill=INK)
    draw.ellipse(box((79, 79, 221, 221)), fill=TOBACCO, outline=INK, width=6 * SCALE)
    draw.ellipse(box((100, 100, 200, 200)), fill=CREAM, outline=INK, width=5 * SCALE)
    draw.ellipse(box((119, 119, 181, 181)), fill=GOLD_BRIGHT, outline=INK, width=4 * SCALE)
    finish(image, "outs-dial.png")


def bulb():
    image, draw = canvas(130, 190)
    draw.ellipse(box((18, 8, 112, 129)), fill="#756B50", outline=INK, width=6 * SCALE)
    draw.polygon(points([(35, 99), (55, 127), (75, 127), (95, 99)]), fill="#756B50")
    line(draw, [(38, 38), (53, 24)], fill=CREAM, width=7)
    line(draw, [(48, 102), (61, 65), (69, 65), (82, 102)], fill=INK, width=3)
    line(draw, [(61, 65), (65, 104), (69, 65)], fill=INK, width=2)
    draw.rounded_rectangle(box((36, 121, 94, 174)), radius=9 * SCALE, fill="#B4AA91", outline=INK, width=5 * SCALE)
    for y in (133, 146, 159):
        line(draw, [(39, y), (91, y - 3)], fill=WOOD_DARK, width=3)
    finish(image, "bulb-off.png")


def glove(name, pose):
    image, draw = canvas(230, 230)
    draw.rounded_rectangle(box((84, 166, 151, 219)), radius=15 * SCALE, fill=GOLD, outline=INK, width=6 * SCALE)
    if pose == "grip":
        draw.ellipse(box((54, 57, 174, 181)), fill=CREAM, outline=INK, width=7 * SCALE)
        for x, y, r in [(43, 45, 25), (83, 24, 24), (124, 26, 24)]:
            draw.ellipse(box((x, y, x + r * 2, y + 105)), fill=CREAM, outline=INK, width=6 * SCALE)
        draw.ellipse(box((142, 91, 218, 157)), fill=CREAM, outline=INK, width=6 * SCALE)
        draw.ellipse(box((94, 101, 139, 146)), fill=PROJECTOR, outline=INK, width=4 * SCALE)
    elif pose == "celebrate":
        draw.ellipse(box((58, 70, 177, 185)), fill=CREAM, outline=INK, width=7 * SCALE)
        draw.rounded_rectangle(box((68, 16, 104, 122)), radius=18 * SCALE, fill=CREAM, outline=INK, width=6 * SCALE)
        for x, y, angle in [(104, 57, 0), (132, 66, 0), (158, 80, 0)]:
            draw.rounded_rectangle(box((x, y, x + 38, y + 82)), radius=18 * SCALE, fill=CREAM, outline=INK, width=6 * SCALE)
    else:
        draw.ellipse(box((52, 64, 180, 188)), fill=CREAM, outline=INK, width=7 * SCALE)
        for x, y, w, h in [(25, 47, 45, 105), (72, 18, 42, 112), (116, 13, 42, 116), (158, 33, 42, 108)]:
            draw.rounded_rectangle(box((x, y, x + w, y + h)), radius=20 * SCALE, fill=CREAM, outline=INK, width=6 * SCALE)
    finish(image, name)


if __name__ == "__main__":
    scale_base()
    scale_beam()
    scale_pan()
    hatch()
    pit()
    dial()
    bulb()
    glove("glove-grip.png", "grip")
    glove("glove-celebrate.png", "celebrate")
    glove("glove-surprise.png", "surprise")
