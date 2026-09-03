# Chip asset brief

The canonical chip is the hand-inked cream clay chip. One sprite set covers HUD,
table stacks, and reward rain.

## Required assets (transparent PNG, no baked ground rectangle)

| Role | Filename | Size | Notes |
| --- | --- | --- | --- |
| face | `chip-face.png` | 490×512 | Top ellipse. Stack caps, HUD lives, chips at rest in the pot. |
| face-empty | `chip-face-empty.png` | 494×512 | Dark inked socket for a spent HUD life. |
| edge | `chip-edge.png` | 512×81 | One chip's side wall. Fully opaque so stacked slices never seam. |
| 3/4 | `chip-3q.png` | 512×450 | Thickness visible. Chips in the air. |

All four live in `my-expo-app/assets/brand/chips/`. Geometry constants live in
`my-expo-app/theme/chipArt.ts`.

## Rules

- Palette: cream `#E8D7A7`, brick-red rim inserts, heavy dark ink, tobacco grain.
- Heavy variable ink. Flat cel fills. Contact shadow is a separate view.
- No glossy bevel, no photoreal clay, no casino brand marks, no baked drop shadow
  under a square canvas.
- Round sprites must key to corner alpha `[0, 0, 0, 0]`.

## Keying workflow

Renders are generated on a solid `#FF00FF` field, then keyed:

```bash
python my-expo-app/scripts/key-chip-sprite.py IN.png OUT.png --max-size 512
python my-expo-app/scripts/key-chip-sprite.py OUT.png --check-only
```

Pass `--inset 4` for slices that tile flush (the edge band).

## Table stack layout

- Bottom edge sits on the felt.
- Columns are edge slices stacked bottom-up, one squashed face on top.
- Slight lean. No idle `translateY` that makes the stack hover.
