"""Cut the chroma-green glove into a transparent overlay for Peek and Pitch."""

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "tables" / "hero-glove-chroma.png"
HAND_OUT = ROOT / "assets" / "tables" / "hero-glove.png"
SHADOW_OUT = ROOT / "assets" / "tables" / "hero-glove-shadow.png"

src = Image.open(SRC).convert("RGBA")
pixels = src.load()
width, height = src.size

for y in range(height):
    for x in range(width):
        red, green, blue, _alpha = pixels[x, y]
        greenness = green - max(red, blue)
        if greenness >= 40:
            pixels[x, y] = (0, 0, 0, 0)
            continue
        spill = max(0, green - (red + blue) // 2)
        keyed_green = max(0, green - int(spill * 0.9))
        fade = 1.0 if greenness <= 8 else max(0.0, (40 - greenness) / 32)
        pixels[x, y] = (red, keyed_green, blue, int(255 * fade))

src.putalpha(src.getchannel("A").filter(ImageFilter.GaussianBlur(0.6)))
bbox = src.getchannel("A").point(lambda value: 255 if value > 14 else 0).getbbox()
if bbox:
    src = src.crop(bbox)

target_width = 760
src = src.resize((target_width, round(src.height * target_width / src.width)), Image.LANCZOS)

pad = round(target_width * 0.06)
canvas = (src.width + pad * 2, src.height + pad * 2)
padded = Image.new("RGBA", canvas, (0, 0, 0, 0))
padded.alpha_composite(src, (pad, pad))
padded.save(HAND_OUT, optimize=True)

silhouette = Image.new("RGBA", canvas, (0, 0, 0, 0))
silhouette.paste((10, 12, 14, 255), (0, 0, *canvas), padded.getchannel("A"))
silhouette.putalpha(silhouette.getchannel("A").filter(ImageFilter.GaussianBlur(pad * 0.5)))
silhouette.save(SHADOW_OUT, optimize=True)

mask = padded.getchannel("A")
mask_pixels = mask.load()
# The pinch lives in the first opaque columns on the left of the glove.
tip_x = 0
tip_y = 0
found = False
for x in range(canvas[0]):
    column = [mask_pixels[x, y] for y in range(canvas[1])]
    if sum(1 for value in column if value > 40) > 6:
        weighted = sum(y * value for y, value in enumerate(column))
        total = sum(column)
        tip_x = x
        tip_y = weighted / max(total, 1)
        found = True
        break

print(f"hand   {padded.size}")
print(f"shadow {silhouette.size}")
if found:
    print(f"contact x={tip_x / canvas[0]:.4f} y={tip_y / canvas[1]:.4f}")
print(f"aspect height/width = {canvas[1] / canvas[0]:.4f}")
