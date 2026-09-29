# World-map path and node progress

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the dotted player trail and four poker-chip nodes on the painted road of every shipped chunk, and show circular 7-spot progress on each node.

**Architecture:** Keep the painted JPEG as the road. Rebuild each chunk’s authored centerline so it follows that dirt in travel order, sample it with Catmull-Rom, and stroke the same samples as a dotted cubic SVG. Nodes stay `landing: true` points on that route. The ring reads `spotsByStage` through the existing `levelMarkers` path. No second progress store. VIP Room stays a scaffold.

**Tech Stack:** Expo / React Native, react-native-svg, Reanimated (uniform scale only), Vitest.

**Spec:** This plan. Product order if anything conflicts: `docs/mvp.md`, then `docs/sprint-current.md`, then feature docs. MVP Section 10 is out of scope.

## Global Constraints

- Phone portrait only. Hit target at least 44pt (48dp on Android). Expo web shows the same phone UI.
- Stay on the current feature branch. Do not pull `origin/dev` or switch branches.
- Do not edit equity-scale, HUD marquee, dial glove, scale rig, audio briefs, video playback, `DecisionFeedbackOverlay`, `CalibrationWelcomeScreen`, `mapFeel.ts`, or the map JPEGs.
- Canonical names stay. Do not invent VIP Room art or a VIP route.
- Two roads stay distinct: the JPEG is the ground truth; the dotted SVG is only an overlay.
- Exactly four nodes per chunk, twelve per world. Do not collapse a world to four nodes.
- Green progress uses `artStyle.colors.feltGreen` (`#4D8A5B`). Add `feltGreenLit: '#7FB88A'` only for the lit arc, because `#4D8A5B` disappears on the tan paintings.
- Trail ink stays as it is: projector-black underlay, gold when the next node is open, cream when locked, dash `1 17`. Add round line joins. Do not replace the painting.

---

## What the paintings show

Traced by drawing the current committed polylines on the six JPEGs. `top` 0 is the top of the chunk. Chunk index 0 is the bottom of the climb (`a`), then `b`, then `c`.

The broken look is not “needs more straight samples.” `withSteps()` already densifies straight cuts. The cuts themselves leave the dirt, and several landings are stored out of travel order, so the line reaches a node, leaves, and hooks back.

### Benny’s Garden A — `map-chunk-a.jpg`

Dirt enters at bottom center, S-curves left through a wide pad, climbs right onto the wooden bridge (the only crossing; it is on the right), then bends left above the river and exits near the top center. The apple tree sits left of that return. The shed and barrel are off the road.

Current failures: a triangular cut across grass between the first two nodes, the bridge polyline running off the right end of the deck (left near 97), and node 3 sitting off the dirt at the right edge.

Centerline intent, bottom to top:

- Enter `(50, 97)`.
- Landing 1 `(55.6, 84)` on the wide lower dirt. This seat is already on the road.
- Follow the S on the dirt: `(46, 78)`, `(40, 73)`.
- Landing 2 `(36, 68)` on the wide left bend, not in the grass triangle.
- Climb to the bridge on the dirt: `(46, 60)`, `(58, 54)`, `(68, 50)`.
- Bridge deck only: `(76, 46)`, `(84, 42)`. Do not use left 97.
- Return on the right bank, still left of the shed: `(76, 36)`, then `(68, 30)`.
- Landing 3 `(68, 30)` on that wide dirt. The chip disk must sit fully on dirt, not on the shed, barrel, or river.
- Above the apple-tree ellipse `(36, 37, rx 17, ry 13)`: `(58, 22)`.
- Landing 4 `(44, 18)` on the upper dirt.
- Exit `(50, 6)` so chunk B can enter at the same left.

Existing test to keep: samples with top 32–42 have left greater than 58 (right bridge, not the tree).

### Benny’s Garden B — `map-chunk-b.jpg`

Card-suit dirt from bottom center, a left bend, the small left plank (not the decorated bridge on the right), then a gentle climb to the top center.

Current failures: node 1 right of center, a zigzag above node 2, and landings stored after the path has already gone past them (`(42, 39.4)` then a point back down at top 40.8; `(42.6, 19.6)` then a point back down at top 24.6).

Centerline intent:

- Enter `(50, 97)`.
- Landing 1 `(50, 84)` centered on the bottom straight.
- `(46, 76)`, `(42, 70)`.
- Landing 2 `(40, 66)` on the wide left bend.
- `(48, 58)`, `(50, 54)`, `(44, 52)`.
- Left plank, `nodeSafe: false`, surface `bridge`: `(42, 49)`, `(42, 46)`. River samples at top 46–52 stay left 39–45. No point in the right bridge box (left 47–64, top 45–54). No `nodeSafe` point on the plank.
- Landing 3 `(44, 38)` on the dirt just above the plank, in travel order.
- `(46, 30)`, `(45, 26)`.
- Landing 4 `(45, 20)` on the upper dirt. The next point must be above it, not below it.
- Exit `(49, 5)`.

### Benny’s Garden C — `map-chunk-c.jpg`

Bottom dirt, a real loop around the flower bed (west side left of 36), then the left plank, then the upper dirt. The flower bed is not road.

Current failures: the polyline crosses the flowers, node 2 sits on the inner edge of the loop, the line jumps from the plank back down to a landing, and node 3 is right of the plank.

Centerline intent, following the loop clockwise from the bottom:

- Enter `(49, 97)`.
- Landing 1 `(52, 86)` on the wide dirt before the loop.
- `(40, 78)`, `(28, 74)`, `(16, 70)`. West samples at top 68–78 must include a left below 36, and those samples must stay on the dirt ring, not the grass outside it.
- Landing 2 `(22, 66)` on the wide west dirt of the loop.
- `(32, 62)`, `(44, 56)`.
- Left plank, `nodeSafe: false`: `(43, 49)`, `(43, 46)`. River samples at top 46–52 stay left 38–52.
- Landing 3 `(46, 40)` on the dirt above the plank.
- `(48, 32)`, `(47, 26)`.
- Landing 4 `(46, 20)` on the upper centerline, with the exit continuing up through it.
- Exit `(49, 5)`.

### A Local Casino A — `map-chunk-a.jpg`

Sandy road up the middle. Nodes 1 and 2 already sit on it. At the cliff the painted road bends left around the stair flights. The stairs and the saloon are not the road. The upper dirt reaches the left, then returns toward top center so it can meet chunk B.

Current failures: node 3 is right of the road at the stair foot, and the corners are sharp. The stair-avoidance test stays: no authored point with top 28–38 and left 43–50.

Centerline intent:

- Enter `(52, 97)`.
- Landing 1 `(51, 83)`.
- Landing 2 `(52, 67)`.
- `(50, 58)`, `(49, 50)`.
- Landing 3 `(49, 44)` on the road center at the foot of the cliff, left of the right-hand cactus.
- Bend left around the stairs, not up the treads: `(44, 38)`, `(36, 32)`, `(30, 26)`.
- Landing 4 `(28, 18)` on the wide upper-left dirt, not on the cliff edge.
- Return on the upper dirt to the top center: `(36, 14)`, `(44, 10)`, exit `(52, 6)`.
- Mid-road samples at top 62–74 stay left greater than 42 (not the left lot). After the last chip, left may dip by at most 1 from Catmull rounding, and the exit left stays within 3 of chunk B’s entry.

### A Local Casino B — `map-chunk-b.jpg`

Center dirt, a wooden boardwalk across the creek, then center dirt again. The side decks, wagon, and trough are not the road.

Current failures: node 1 right of center, node 2 on the left edge, the boardwalk approach clipping the left of the span, node 3 slightly left, and a hook past node 4.

Centerline intent:

- Enter `(52, 97)`.
- Landing 1 `(50, 82)` on the center of the lower straight.
- `(50, 72)`.
- Landing 2 `(49, 64)` on the center just before the planks.
- Boardwalk, `nodeSafe: false`, surface `boardwalk`: `(50, 54)`, `(51, 48)`. Cross the middle of the span.
- Landing 3 `(52, 40)` on the dirt just above the span.
- `(53, 32)`.
- Landing 4 `(53, 23)` on the upper centerline.
- Exit `(52, 5)`.

### A Local Casino C — `map-chunk-c.jpg`

The dirt is already close. Node 3 is sitting on the bridge deck. Nodes must stay on `surface: 'road'`.

Centerline intent:

- Enter `(52, 97)`.
- Landing 1 `(52, 83)`.
- `(51, 70)`.
- Landing 2 `(50, 60)` on the dirt below the bridge.
- Bridge, `nodeSafe: false`, surface `bridge`: `(50, 50)`, `(50, 44)`.
- Landing 3 `(50, 38)` on the dirt just above the bridge.
- Landing 4 `(50, 24)` on the upper center.
- Exit `(52, 6)`.

### Seams

Where two chunks meet, the exit left and the next entry left differ by at most 3. Garden A/B meet at 50. Garden B/C meet at 49. Casino A/B/C meet at 52. Do not add a kink point to force the seam; the last and first controls are the seam.

### Corrections after gridding the JPEGs (these win over the lists above)

A 5% grid over each painting showed several of the positions above were off the dirt. The shipped controls live in `bennysGardenRoads.ts` and `localCasinoRoads.ts`. The seats are:

| Chunk | Landings (left, top) |
| --- | --- |
| Garden A | (46, 85), (33, 66), (87, 31), (38, 15.5) |
| Garden B | (51, 84), (40, 65), (41, 39), (42, 19) |
| Garden C | (52, 85), (22, 75.5), (41, 39), (29, 19.5) |
| Casino A | (51, 82), (51, 66), (52, 42), (30, 20.5) |
| Casino B | (43, 82), (42, 64), (55, 39), (56, 22) |
| Casino C | (53, 82), (50, 62), (48, 44), (50, 20) |

- Garden A: the road above the bridge runs up the right edge (left 85–95). `(68, 30)` is bushes. Seat 3 is `(87, 31)`.
- Garden C: `(22, 66)` is the flower bed. Seat 2 sits on the wide bottom-left of the loop. Seat 4 sits left of the bush in the upper pad (bush is left 36–50, top 17–22).
- Both plank crossings are centered near left 40, not 42–43.
- Casino A: the painted road is the two stair flights plus the plaza between them. The route climbs them. The old “avoid the stair box” test is replaced by “stays left of the saloon” (no point with left above 60 and top below 50). Seat 3 is the plaza. Seat 4 stays below the sandstorm band (top 17), so it is `(30, 20.5)`.
- Seams: the paintings only overlap at the road edge. Garden A/B meet at 50, Garden B/C at 48, Casino A/B at 50, Casino B/C at 60.

---

## Curve

Do not use `svgQuadPath` or `walkPolyline`. Their alternating bulge invents curves that leave the road.

1. Author the sparse controls above, in travel order, in `bennysGardenRoads.ts` and `localCasinoRoads.ts`.
2. `smoothRoute(controls)` in a new `lib/track/smoothRoute.ts` samples uniform Catmull-Rom, about 8 samples per span, rounded to 0.1. Drop near-duplicates. Landing points stay `landing: true`, `surface: 'road'`, `nodeSafe: true`. Other samples are `nodeSafe: false`. If either endpoint is `bridge` or `boardwalk`, intermediate samples use that surface.
3. `svgRouteSegment` returns cubic `C` commands from `svgCatmullRom`, not `L` commands from `svgPolyline`.
4. Both trail paths in `LevelProgressionMap` use `strokeLinecap="round"` and `strokeLinejoin="round"`.

**Corner test.** Measure the turn between consecutive samples in chunk pixel space (`x = left/100 * width`, `y = top/100 * height`), using the real 9:16 art. Skip segments shorter than 0.15 percent of the chunk diagonal. Every remaining turn is at most **36 degrees**. If the garden C loop fails, add controls on the dirt until the sampled curve passes. Do not raise the threshold to hide a corner.

`routeIndex` still comes from `pickRouteNodes` on the landing flags, so the trail and the chips share one path.

If a control misses the dirt when drawn on the JPEG, move that control along the painted centerline and update this plan before continuing. Do not smooth a bad control and call it done.

---

## Node size

One function of map width, reference width 390, where today’s chip is 53px.

- `mapNodeChipSize(width) = clamp(round(width * 53 / 390), 44, 64)`
- Ring pad `max(10, round(chip * 14 / 53))`. Ring = chip + pad.
- Label height `max(16, round(chip * 0.34))`.
- Frame width equals the ring. The label is a short percent (`43%`, `100%`), centered above the ring. It does not need a 96px-wide frame.
- Anchor is the center of the ring, not the center of the wider frame. The label sits above the ring and shifts the frame up by the label height only when the label is visible.
- Hero pin `clamp(round(width * 72 / 390), 60, 96)`. When `spotsCompleted > 0`, lift the pin by `6 + ring/2 + labelHeight` so it clears the label.
- `hitSlop` grows so the pressable is at least 44 on iOS and 48 on Android even when the visible chip is 44.

`MAP_NODE_CHIP_SIZE = 53` stays as the 390px reference. Call sites that place or hit-test a node take the width-based metrics.

---

## Ring states

Duolingo is the structure only: circle, locked, open, partial arc, full ring. No Duolingo type, mascot, or hex values.

### Progress is a percentage of that level

Every level’s progress is only the percentage of that level that is done. The level is still 7 spots. The player never sees a spot count.

`formatSpotPercent(spots) = round(clamp(spots, 0, 7) / 7 * 100)`, then a `%` sign.

| Spots done | Shown |
| --- | --- |
| 0 | no percent (nothing of the level is done) |
| 1 | `14%` |
| 2 | `29%` |
| 3 | `43%` |
| 4 | `57%` |
| 5 | `71%` |
| 6 | `86%` |
| 7 | `100%` |

The lit arc is that same percentage of the circle, starting at 12 o’clock. Do not draw a second meter. Do not write `3 out of 7`, `N out of 7`, or any spot count on the node or in its accessibility label.

`nodeRingPhase(status, spots)`:

| Phase | When | Draw |
| --- | --- | --- |
| `locked` | status `locked` | Unlit track `projectorBlack`. Tobacco wash on the chip. Padlock. No green. No percent. Press shakes and does not navigate. |
| `open` | not locked, spots `<= 0` | Unlit track `tobacco`. A 2.5px `feltGreen` hairline. No filled arc. No percent. Can be entered. |
| `progress` | spots 1–6 | Tobacco track. Lit arc `feltGreenLit` on that same outer circle only, stroke 5, round cap, length = that percent of the circle, starting at 12 o’clock. No pie wedge on the chip. The ring is centered on the chip. Label is only the percent (`43%` at 3 spots), cream, above the circle. Bebas Neue if that screen already loaded it. |
| `complete` | status `completed` or spots `>= 7` | Full `feltGreenLit` outer ring, label `100%`. No pie wedge. Completing a node still unlocks the next node. Do not change that rule. Remove the gold star ring. |

The ring is a true circle. Pulse and press use one uniform scale. No non-uniform scale, no translate that squashes the ring. Locked shake may move the whole node on x.

Accessibility: locked announces `"{title}, locked"`. Open announces `"{title}"`. Progress and complete announce `"{title}, {percent} percent"` (for example `River bend, 43 percent`).

The percent label is hidden when locked or when spots are 0.

### Data

`spotsByStage` already flows CalibrationHarness → TrackMapScreen → LevelProgressionMap → `levelMarkers`. Each resolved hand already calls `onResolved` and writes `spotsByStage[stage]`. Leave level only calls `onBack` and must not clear that record.

Fix `openStage`: for every stage, including dev mode, seed `stageSpotsCompleted` from `spotsByStage[stage] ?? 0`. Today dev mode and any stage other than 1 force `0`, so the next hand overwrites a 3 with a 1. Do not add a new store.

---

## Files

Change:

- `my-expo-app/lib/track/smoothRoute.ts` (new)
- `my-expo-app/lib/track/mapPath.ts` and `mapPath.test.ts`
- `my-expo-app/lib/track/worldMapGeometry.ts`
- `my-expo-app/lib/track/bennysGardenRoads.ts`, `gardenMap.test.ts`
- `my-expo-app/lib/track/localCasinoRoads.ts`, `localCasinoMap.test.ts`
- `my-expo-app/lib/track/tree.ts`, `tree.test.ts`
- `my-expo-app/lib/hud/nodeLayout.ts`, `nodeLayout.test.ts`
- `my-expo-app/lib/hud/mapHeroPin.ts`, `mapHeroPin.test.ts`
- `my-expo-app/components/track/LevelProgressionMap.tsx`
- `my-expo-app/components/track/MapNodeMedallion.tsx`
- `my-expo-app/components/track/MapCheckpoint.tsx`
- `my-expo-app/components/track/MapHeroPin.tsx`
- `my-expo-app/theme/artStyle.ts` (`feltGreenLit` only)
- `my-expo-app/components/CalibrationHarness.tsx` (`openStage` seed only)

Leave alone: VIP scaffold in `worldMapTemplates.ts`, map JPEGs, `mapFeel.ts`, audio, video, equity scale, HUD marquee, welcome screen, `DecisionFeedbackOverlay`.

`LevelProgressionMap` / `MapCheckpoint` already grew an optional `onPressIn` so the unstashed map-audio work still compiles. Keep that callback. Do not fold audio into this job.

---

## Tasks

### Task 1: Smooth path primitive

- [ ] Add a failing test: a 90° elbow through `smoothRoute` / `svgCatmullRom` stays at or under 36° in 9:16 pixel space, and the SVG contains ` C `.
- [ ] Implement `catmullRomPoint`, `svgCatmullRom`, `maxSegmentTurnDeg`, and `smoothRoute`.
- [ ] Point `svgRouteSegment` at `svgCatmullRom`.
- [ ] Run `mapPath` and `worldMapGeometry` tests.

### Task 2: Garden centerlines

- [ ] Replace Garden A/B/C controls with the lists in this plan, passed through `smoothRoute`.
- [ ] Update the frozen-seat expectations to the four new landings per chunk.
- [ ] Assert exactly four landings, each node on its route point, max turn ≤ 36°, and the existing bridge / tree / west-loop region tests.
- [ ] Draw the new samples on the three JPEGs. If a sample leaves dirt, move the control and update this plan.

### Task 3: Casino centerlines

- [ ] Replace Casino A/B/C the same way.
- [ ] Keep the left-lot test and bridge plus boardwalk surfaces. Replace the stair-box test with “stays left of the saloon.”
- [ ] Same landing, on-route, and turn tests.
- [ ] Overlay the three JPEGs before calling the routes done.

### Task 4: Size and ring

- [ ] Failing tests for chip size (390 → 53, 320 → 44, 480 → 64), `formatSpotPercent` (3 spots → `43%`, 7 spots → `100%`, 0 spots → no label), and `nodeRingPhase`.
- [ ] Implement metrics, hero size, and the four ring states in the medallion.
- [ ] Position the frame from the ring anchor. Lift the hero when the label is showing.
- [ ] Uniform scale only. Accessibility strings as specified.

### Task 5: Spot count survives leave and re-entry

- [ ] Seed `openStage` from `spotsByStage`.
- [ ] Confirm `onBack` does not clear `spotsByStage`.

### Task 6: Phone check

On a phone-sized viewport (web preview frame is fine if it is the same portrait UI):

- [ ] Garden and Casino chunks a, b, and c: dotted trail on the dirt, round bends, four chips on wide pads.
- [ ] Open node at 0/7 can be entered and shows the open hairline.
- [ ] Finish 3 spots, leave, return to the map: that node shows a 43% arc and the text `43%`. No spot count.
- [ ] A finished node shows a full green ring and `100%`, and the next node can open.
- [ ] A locked node is unlit, announces locked, and does not enter.
- [ ] VIP Room has no new route.

A single screenshot is not this check.

---

## Out of scope

New worlds, new paintings, fog redesign, HUD, equity scale, a walking avatar, web-only layout, MVP Section 10.
