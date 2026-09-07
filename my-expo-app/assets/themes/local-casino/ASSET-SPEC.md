# Local Casino map asset contract

Phone-first World 2 progression map. Product name: **A Local Casino**.
Environment: outdoor 1930s rubber-hose Wild West desert town. Daytime only
this sprint. Casino interiors are future lesson/table scenes, not these files.

Runtime tokens: `my-expo-app/theme/localCasinoMap.ts` (imports `artStyle.colors`
where they already exist). Visual authority: `docs/art-style-guide.md`.

## Final runtime files

Directory: `my-expo-app/assets/themes/local-casino/`

| Role | Filename | Mode | Size |
| ---- | -------- | ---- | ---- |
| Base chunk A | `map-chunk-a.jpg` | RGB JPEG | 576×1024 |
| Base chunk B | `map-chunk-b.jpg` | RGB JPEG | 576×1024 |
| Base chunk C | `map-chunk-c.jpg` | RGB JPEG | 576×1024 |
| Progression | `map-progress-{a\|b\|c}-{1\|2\|3\|4}.png` | RGBA PNG | 576×1024 |
| Haze left | `map-haze-left.png` | RGBA PNG | 576×1024 |
| Haze right | `map-haze-right.png` | RGBA PNG | 576×1024 |
| Film grain | `map-film-grain.png` | RGB or L PNG | 576×1024 |

Do not put `references-world-map/` images or source masters on the runtime
`require(...)` path.

## Source masters

- Editable layered masters at **1152×2048 or larger**.
- Downsample to 576×1024 with **Lanczos**.
- Keep masters outside the Metro bundle if the format is unsupported
  (for example PSD/TIFF under `sources/`, never `require`'d).
- Preserve layers so a later moonlight/lantern grade can reuse geometry.

## Route and node-safe regions

Percentages are of the **final** 576×1024 canvas. `top` is from the image top.

- Route enter (bottom gate): near bottom center, **`top > 85%`**.
- Route exit (top gate): near top center, **`top < 20%`**.
- Four node-safe zones per chunk, ~**80×80 px**, visually quiet, at about
  **18%, 39%, 61%, and 83%** of route distance from bottom to top.
- HUD / chip-count / control bands stay clear of baked labels and overlay paint.

## Layer order (bottom → top at runtime)

1. Base JPEG chunk.
2. Unlocked progression overlays (additive; never a full re-paint of the base).
3. Film grain (effective opacity **4%**).
4. Dust / cream flicker (≤ **2%** brightness) and vignette — scenery only.
5. Haze left/right (parts like Benny’s fog; not opaque storm clouds).
6. Route, checkpoints, avatar, HUD, and controls **above** all film layers.

## Overlay and alpha rules

- Each `map-progress-*.png` contains **only** new milestone pixels. All other
  pixels are fully transparent (`alpha = 0`).
- Corners of every overlay and both haze files must be fully transparent.
- Overlays must include **meaningful** alpha: both opaque paint and empty
  transparent area (no solid rectangle, no fully empty file).
- Never cover the avatar route or invent a second path.
- Generated artwork contains **no essential labels**. Decorative lettering is
  hand-redrawn and nonessential.

## JPEG quality

- Export bases as RGB JPEG. Start at quality **86**; confirm at 320–430 pt width.
- No progressive-only tricks that Metro cannot load.

## Palette and film

Use `localCasinoMapTheme` roles: terrain, adobe, facade, vegetation, wood, ink.
Casino Teal is trim/sign only (`maxTealCoverage` 0.03). Felt Green and Oxblood
are runtime progression/lock colors, not scenery. Grain 3–6% baked or overlaid;
dust 1–3%; flicker ≤ 2%. Cream/gold labels on Projector Black or Tobacco must
meet WCAG AA.

## Prohibited

- Indoor casino-hall map art; night mode as the shipped treatment.
- Tracing or copying `references-world-map` landmarks or Monument Valley
  compositions.
- Pixel art, photorealism, modern vector polish, floating candy/mesa islands,
  skull pits, branded imagery, cyberpunk neon, essential baked UI text.
- Film grain, dust, or vignette over HUD text, node labels, chip counts, or
  controls.

## Validation

```text
python scripts/validate-local-casino-assets.py
npm run assets:check:local-casino
```

The checker fails with filename-specific errors until the 18 runtime files exist
and match this contract.
