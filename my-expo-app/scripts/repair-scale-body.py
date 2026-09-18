"""Fill the 7-row mask gap in scale-body.png from the original character art."""
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "tables" / "equity-scale"


def is_teal_hose(r, g, b, a):
    return a >= 16 and g > r + 10 and 40 < g < 160 and r < 100 and b > 40


src = Image.open(ASSETS / "scale-character.png").convert("RGBA")
body = Image.open(ASSETS / "scale-body.png").convert("RGBA")
spx, bpx = src.load(), body.load()
for y in range(220, 233):
    for x in range(310, 761):
        p = spx[x, y]
        if p[3] >= 16 and not is_teal_hose(*p):
            bpx[x, y] = p
body.save(ASSETS / "scale-body.png")
print("repaired rows 220-232, bbox=", body.getbbox())

gaps = []
for y in range(210, 241):
    if all(bpx[x, y][3] < 16 for x in range(body.size[0])):
        gaps.append(y)
if gaps:
    raise SystemExit(f"fully transparent rows remain: {gaps}")
print("no fully transparent row between y=210 and y=240")
