#!/usr/bin/env python3
"""Render static Hot Seats hand-fit proofs for owner approval.

Review images only. This does not change app behavior.

The outer rectangles are the measured card silhouettes on the 571×1024 plates.
Red annotation pixels from the reference photo are not copied. Both skins share
one geometry so a casino leak is visible instead of hidden by a larger shell.

Usage:
    python my-expo-app/scripts/render-hot-seat-hand-preview.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "my-expo-app" / "assets"
FACES = ASSETS / "tables" / "playing-cards"
OUT_DIR = ROOT / "docs" / "superpowers" / "artifacts"

ART_SIZE = (571, 1024)

# Source-art pixels. Left card is underneath; right card is above it.
OUTER_SLOTS = (
    {"cx": 258, "cy": 858, "width": 136, "height": 196, "rotation": -13},
    {"cx": 333, "cy": 849, "width": 120, "height": 187, "rotation": 10},
)
FACE_INSET = 4
BLACK = (17, 23, 20, 255)  # artStyle projectorBlack
SAMPLE_HANDS = (("As", "Kh"), ("7c", "8d"), ("Qd", "Jc"))
PHONES = ((375, 667), (390, 844), (430, 932))

SUIT_FILE = {"s": "Spades", "h": "Hearts", "d": "Diamonds", "c": "Clubs"}
RANK_FILE = {
    "A": "A",
    "K": "K",
    "Q": "Q",
    "J": "J",
    "T": "10",
    "9": "9",
    "8": "8",
    "7": "7",
    "6": "6",
    "5": "5",
    "4": "4",
    "3": "3",
    "2": "2",
}


def face_path(code: str) -> Path:
    rank, suit = code[0], code[1]
    return FACES / f"card{SUIT_FILE[suit]}{RANK_FILE[rank]}.png"


def load_font(size: int) -> ImageFont.ImageFont:
    for candidate in (
        Path(r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\segoeui.ttf"),
    ):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def build_card(code: str, slot: dict) -> Image.Image:
    """Black outer rectangle, face stretched into a 4px local inset, then rotated.

    React Native `rotate` is clockwise-positive. Pillow rotates counter-clockwise,
    so the Pillow angle is the negation of the stored slot rotation.
    """
    width = slot["width"]
    height = slot["height"]
    card = Image.new("RGBA", (width, height), BLACK)
    inner = (
        width - 2 * FACE_INSET,
        height - 2 * FACE_INSET,
    )
    face = Image.open(face_path(code)).convert("RGBA").resize(inner, Image.Resampling.LANCZOS)
    card.paste(face, (FACE_INSET, FACE_INSET), face)
    return card.rotate(
        -slot["rotation"],
        resample=Image.Resampling.BICUBIC,
        expand=True,
        fillcolor=(0, 0, 0, 0),
    )


def composite_centered(base: Image.Image, layer: Image.Image, cx: int, cy: int) -> Image.Image:
    full = Image.new("RGBA", base.size, (0, 0, 0, 0))
    x = int(round(cx - layer.width / 2))
    y = int(round(cy - layer.height / 2))
    full.paste(layer, (x, y), layer)
    return Image.alpha_composite(base, full)


def render_panel(plate: Image.Image, thumb: Image.Image, hand: tuple[str, str], *, cards_under_plate: bool) -> Image.Image:
    canvas = Image.new("RGBA", ART_SIZE, (0, 0, 0, 0))
    if not cards_under_plate:
        canvas = Image.alpha_composite(canvas, plate)
    for code, slot in zip(hand, OUTER_SLOTS, strict=True):
        canvas = composite_centered(canvas, build_card(code, slot), slot["cx"], slot["cy"])
    if cards_under_plate:
        canvas = Image.alpha_composite(canvas, plate)
    return Image.alpha_composite(canvas, thumb)


def assemble(panels: list[tuple[str, Image.Image]]) -> Image.Image:
    gap = 10
    header = 34
    width = sum(panel.width for _, panel in panels) + gap * (len(panels) - 1)
    height = header + panels[0][1].height
    sheet = Image.new("RGBA", (width, height), BLACK)
    draw = ImageDraw.Draw(sheet)
    font = load_font(18)
    x = 0
    for label, panel in panels:
        draw.text((x + 12, 8), label, fill=(243, 230, 196, 255), font=font)
        sheet.paste(panel, (x, header), panel)
        x += panel.width + gap
    return sheet


def rect_mask(slot: dict, inset: int) -> Image.Image:
    """Nearest-neighbor mask of the rotated rectangle, for coverage checks."""
    width = slot["width"] - 2 * inset
    height = slot["height"] - 2 * inset
    rect = Image.new("L", (width, height), 255)
    rotated = rect.rotate(-slot["rotation"], resample=Image.Resampling.NEAREST, expand=True)
    mask = Image.new("L", ART_SIZE, 0)
    x = int(round(slot["cx"] - rotated.width / 2))
    y = int(round(slot["cy"] - rotated.height / 2))
    mask.paste(rotated, (x, y), rotated)
    return mask


def assert_local_rim(code: str, slot: dict) -> None:
    width = slot["width"]
    height = slot["height"]
    card = Image.new("RGBA", (width, height), BLACK)
    face = Image.open(face_path(code)).convert("RGBA").resize(
        (width - 2 * FACE_INSET, height - 2 * FACE_INSET),
        Image.Resampling.LANCZOS,
    )
    card.paste(face, (FACE_INSET, FACE_INSET), face)
    px = card.load()
    probes = (
        (width // 2, 0, 0, 1),
        (width // 2, height - 1, 0, -1),
        (0, height // 2, 1, 0),
        (width - 1, height // 2, -1, 0),
    )
    for x, y, dx, dy in probes:
        for step in range(FACE_INSET):
            pixel = px[x + dx * step, y + dy * step]
            if pixel != BLACK:
                raise SystemExit(f"{code} rim step {step} at {(x, y)} is {pixel}, expected {BLACK}")
        inside = px[x + dx * FACE_INSET, y + dy * FACE_INSET]
        if inside[:3] == BLACK[:3]:
            raise SystemExit(f"{code} face at inset {FACE_INSET} is still the rim color")


def coverage_report(plate: Image.Image, thumb: Image.Image) -> None:
    outer = [rect_mask(slot, 0) for slot in OUTER_SLOTS]
    inner = [rect_mask(slot, FACE_INSET) for slot in OUTER_SLOTS]
    plate_alpha = plate.getchannel("A")
    thumb_alpha = thumb.getchannel("A")
    overlap = 0
    thumb_on_right = 0
    rim_visible = 0
    rim_total = 0
    window_gap = 0
    pa = plate_alpha.load()
    ta = thumb_alpha.load()
    om = [mask.load() for mask in outer]
    im = [mask.load() for mask in inner]
    for y in range(ART_SIZE[1]):
        for x in range(ART_SIZE[0]):
            left = om[0][x, y] > 128
            right = om[1][x, y] > 128
            if left and right:
                overlap += 1
            if right and ta[x, y] > 128:
                thumb_on_right += 1
            on_rim = (left and im[0][x, y] <= 128) or (right and im[1][x, y] <= 128)
            if on_rim:
                rim_total += 1
                if pa[x, y] == 0 or plate.mode == "RGB":
                    rim_visible += 1
            if pa[x, y] == 0 and ta[x, y] <= 128 and not left and not right:
                window_gap += 1
    if overlap < 2000:
        raise SystemExit(f"right card does not overlap the left card ({overlap} px)")
    if thumb_on_right < 500:
        raise SystemExit(f"thumb does not cover the right card ({thumb_on_right} px)")
    print(f"  overlap px: {overlap}")
    print(f"  thumb-on-right px: {thumb_on_right}")
    print(f"  rim pixels inside the open window: {rim_visible} / {rim_total}")
    print(f"  window pixels missed by both cards and the thumb: {window_gap}")


def baked_card_leak(casino: Image.Image, thumb: Image.Image) -> int:
    """Pale casino-plate pixels in the hand that neither card nor the thumb covers."""
    outer = [rect_mask(slot, 0) for slot in OUTER_SLOTS]
    rgb = casino.convert("RGB")
    px = rgb.load()
    ta = thumb.getchannel("A").load()
    om = [mask.load() for mask in outer]
    leak = 0
    for y in range(720, 990):
        for x in range(150, 450):
            r, g, b = px[x, y]
            pale = r > 176 and g > 168 and b > 150 and r + 25 > g and g + 35 > b
            covered = om[0][x, y] > 128 or om[1][x, y] > 128 or ta[x, y] > 128
            if pale and not covered:
                leak += 1
    return leak


def cover_view(panel: Image.Image, screen_w: int, screen_h: int) -> Image.Image:
    scale = max(screen_w / ART_SIZE[0], screen_h / ART_SIZE[1])
    resized = panel.resize(
        (round(ART_SIZE[0] * scale), round(ART_SIZE[1] * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - screen_w) // 2
    top = (resized.height - screen_h) // 2
    return resized.crop((left, top, left + screen_w, top + screen_h))


def write_phone_sheet(path: Path, panel: Image.Image, title: str) -> None:
    crops = []
    for screen_w, screen_h in PHONES:
        phone = cover_view(panel, screen_w, screen_h)
        # The held cards sit in the bottom of the painting. Keep that band.
        band_top = int(phone.height * 0.62)
        crops.append((f"{screen_w}×{screen_h}", phone.crop((0, band_top, phone.width, phone.height))))
    gap = 8
    header = 28
    width = sum(crop.width for _, crop in crops) + gap * (len(crops) - 1)
    height = header + max(crop.height for _, crop in crops)
    sheet = Image.new("RGBA", (width, height), BLACK)
    draw = ImageDraw.Draw(sheet)
    font = load_font(16)
    x = 0
    for label, crop in crops:
        draw.text((x + 8, 6), f"{title}  {label}", fill=(243, 230, 196, 255), font=font)
        sheet.paste(crop, (x, header))
        x += crop.width + gap
    sheet.save(path)


def hand_zoom(panel: Image.Image) -> Image.Image:
    crop = panel.crop((145, 700, 460, 1010))
    return crop.resize((crop.width * 2, crop.height * 2), Image.Resampling.NEAREST)


def main() -> None:
    garden_plate = Image.open(ASSETS / "hot-seats" / "bennys-garden.png").convert("RGBA")
    casino_plate = Image.open(ASSETS / "hot-seats" / "local-casino.jpg").convert("RGBA")
    thumb = Image.open(ASSETS / "hot-seats" / "garden-thumb.png").convert("RGBA")
    if garden_plate.size != ART_SIZE or casino_plate.size != ART_SIZE or thumb.size != ART_SIZE:
        raise SystemExit("table plates and the thumb must all be 571×1024")

    for slot in OUTER_SLOTS:
        for code in {card for hand in SAMPLE_HANDS for card in hand}:
            assert_local_rim(code, slot)

    print("garden")
    coverage_report(garden_plate, thumb)
    print("casino baked-card leak px:", baked_card_leak(casino_plate, thumb))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    skins = (
        ("garden", garden_plate, True, OUT_DIR / "hot-seats-card-fit-garden.png"),
        ("casino", casino_plate, False, OUT_DIR / "hot-seats-card-fit-casino.png"),
    )
    for skin, plate, cards_under_plate, path in skins:
        panels = []
        for hand in SAMPLE_HANDS:
            label = f"{hand[0]} / {hand[1]}"
            panels.append((label, render_panel(plate, thumb, hand, cards_under_plate=cards_under_plate)))
        sheet = assemble(panels)
        sheet.save(path)
        print(f"wrote {path.relative_to(ROOT)} {sheet.size}")
        zoom = assemble([(label, hand_zoom(panel)) for label, panel in panels])
        zoom_path = OUT_DIR / f"hot-seats-hand-zoom-{skin}.png"
        zoom.save(zoom_path)
        print(f"wrote {zoom_path.relative_to(ROOT)} {zoom.size}")

    if "--phones" in sys.argv:
        # Middle sample hand is enough to judge cover-crop; geometry is shared.
        for skin, plate, cards_under_plate in (
            ("garden", garden_plate, True),
            ("casino", casino_plate, False),
        ):
            panel = render_panel(plate, thumb, SAMPLE_HANDS[1], cards_under_plate=cards_under_plate)
            phone_path = OUT_DIR / f"hot-seats-card-phones-{skin}.png"
            write_phone_sheet(phone_path, panel, f"{skin} 7c/8d")
            print(f"wrote {phone_path.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
