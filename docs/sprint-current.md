> Current sprint plan. Build only what this file scopes; for product conflicts defer to `docs/mvp.md` (Rev. 2).

SWEET SPOT
Current sprint — World 2 outdoor Local Casino map
Phone-first Expo track map · Daytime desert town · Art + placement wiring
Prepared for the Local Casino map implementation

## 1. Sprint Goal

Ship World 2’s progression map as a daytime outdoor 1930s rubber-hose Wild West desert town. The product name remains **A Local Casino**; the town climb ends at the Local Casino façade. Reuse Benny’s Garden map grammar (576×1024 portrait chunks, four nodes per chunk, bottom-to-top routes, avatar walk, camera climb, haze transition, progression-aware nodes) and add transparent milestone overlays.

Casino-interior lesson and table scenes, night mode, and Level 2 question-template content are not this sprint.

## 2. Authority

1. `docs/mvp.md` Section 6 — world name, day-first treatment, interior vs map.
2. This file — what to build now.
3. `docs/art-style-guide.md`, `docs/moodboard/README.md`, `my-expo-app/theme/localCasinoMap.ts`, and `my-expo-app/assets/themes/local-casino/ASSET-SPEC.md` — look and asset contract.

Runtime is Expo / React Native on a portrait phone. Preserve safe areas, 44×44 pt controls, reduced-motion behavior, and non-color state cues.

## 3. In Scope

- Canonical docs aligned on outdoor World 2 (this sprint’s first commit).
- Palette module, asset spec, and Pillow validator for Local Casino map files.
- Three daytime base chunks: Town Gate / Saloon Row, Civic Main Street, Casino Rise.
- Twelve additive transparent progression overlays (four per chunk).
- Desert haze pair and one film-grain texture.
- Authored route geometry and a world-agnostic route engine shared with Benny’s Garden.
- World selection by calibration placement (1 → Benny’s Garden, 2 → Local Casino, 3 → unavailable VIP scaffold — no silent Benny fallback).
- Level-specific stage-progress loading for placement 2 (never Level 1 rows).
- Art-only film treatment (grain, dust, vignette, ≤2% flicker) below HUD and node UI.
- Unit tests for geometry, progression visibility, and world selection.
- Android visual/performance QA and Benny’s Garden regression.

## 4. Explicitly Out of Scope

- Night mode / dark grade (keep source layers editable for later).
- New question templates or Level 2 lesson / table content.
- Casino-interior screens (future; not the map).
- Procedural poker generation, `treys`, `7eval`, or equity work.
- Currency, Chip, Elo, Gold Coin, Daily Challenge, or Bankroll changes.
- World 3 production art.
- Desktop/web-only layouts.

## 5. World 2 map contract

- Chunks A → B → C, fixed order (no random rotation).
- Chunk A: town gate, dusty street, saloon as side scenery, hitching rail, water-tower foundation.
- Chunk B: General Store and Sheriff’s Office, boardwalk/bridge, trough and wagon staging.
- Chunk C: depot/stable, climb to the upper district, Local Casino façade with restrained teal trim.
- Four quiet ~80×80 px node-safe zones per chunk; route enters near bottom center (`top > 85%`) and exits near top center (`top < 20%`).
- Progression overlays add route brands, lived-in props, district lights, then landmark completion. They never replace node lock/current/complete UI.
- Casino Teal is trim only (under 3% of image area). Felt Green / Oxblood are runtime feedback, not scenery.

## 6. Acceptance

### Assets (runtime bundle)

All files live under `my-expo-app/assets/themes/local-casino/` at **576×1024**:

| Count | Filenames |
| ----- | --------- |
| 3 RGB JPEG bases | `map-chunk-a.jpg`, `map-chunk-b.jpg`, `map-chunk-c.jpg` |
| 12 RGBA overlays | `map-progress-{a\|b\|c}-{1\|2\|3\|4}.png` |
| 2 RGBA haze | `map-haze-left.png`, `map-haze-right.png` |
| 1 grain | `map-film-grain.png` |

Source masters are 1152×2048 or larger, Lanczos-downsampled, and stay **out of the Metro bundle** if their format is unsupported. JPEG quality starts at 86 and is visually confirmed at phone size.

### Commands

- `python my-expo-app/scripts/validate-local-casino-assets.py` (or `npm run assets:check:local-casino` from `my-expo-app`) — PASS once production assets exist; must fail with filename-specific errors when files are missing.
- `npx vitest run lib/track/worldMapGeometry.test.ts lib/track/gardenMap.test.ts lib/track/localCasinoMap.test.ts lib/track/worldProgression.test.ts lib/track/tree.test.ts lib/track/mapPath.test.ts lib/track/fogCycle.test.ts` — PASS after those modules exist.
- `npm test` and `npm run lint` from `my-expo-app` — PASS before calling the sprint done.

Do not treat a full e2e suite as a gate for the docs/palette commits.

### Phone QA (after art + runtime)

- Placement 1 still shows Benny’s Garden; placement 2 shows Local Casino with Level 2 progress.
- Portrait widths 320 / 360 / 390 / 430 pt: path, landmarks, labels, and 44×44 pt targets remain readable.
- Completed counts `0, 1, 4, 5, 8, 9, 12` reveal exactly the expected overlays.
- Grain, dust, vignette, and flicker never cover labels, chip counts, or controls; reduced motion disables flicker.
- World 3 stays an explicit unavailable state.

## 7. Definition of Done

Canon and sprint docs agree: outdoor desert town, name **A Local Casino**, daytime first, interiors future-only. Approved daytime chunks and overlays pass the Asset Production Checklist and the Pillow validator. Placement 2 players walk the desert town with their own progress. Benny’s Garden is unchanged. Night mode and Level 2 lessons remain unbuilt.
