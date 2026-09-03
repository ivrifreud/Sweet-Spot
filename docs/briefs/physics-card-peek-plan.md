# Physics-based card Peek — implementation plan

Retry this from a fresh `origin/dev` branch. Do not treat the discarded `cursor/physics-card-peek` attempt as source.

Canonical names: **The Peek and Pitch**. Frozen motion: `docs/briefs/peek-motion-brief.md`. Visual refs: `docs/moodboard/references-art-style/`. Interactive copy of this plan: Cursor canvas `physics-card-peek-plan.canvas.tsx`.

## Product constraint

`docs/mvp.md` defines Peek as long-press; pull-down is an action gesture elsewhere. Arm Peek only after a **card-local 100–120 ms hold**, then map downward pull to the bend. Do not steal Fold (swipe up), Check, Call, or Raise.

## Architecture

| Layer | Library | Role |
| --- | --- | --- |
| Gesture | `react-native-gesture-handler` (`Gesture.Pan` / `GestureDetector`) | Hold, pull, race with Fold |
| Orchestration | `react-native-reanimated` shared values | UI-thread progress, settle springs |
| Render | `@shopify/react-native-skia` `Vertices` + `ImageShader` | C-curve mesh, mask, light, shadow |

A rigid `rotateX` / 4×4 matrix stays planar — no arch. Do not ship another 8-slice band approximation.

Keep React state for gameplay only. Every per-frame value stays on the UI runtime.

### Go / no-go before coding

1. `npx expo install @shopify/react-native-skia` (do not hand-pick a version).
2. Confirm Expo 54 + RN 0.81 + React 19 + Reanimated 4.1 + **Worklets** can drive Skia mesh props from a shared value with **no JS per-frame callback**.
3. Spike: one 5×7 textured grid on iOS and Android.
4. If Worklets must jump (docs have asked for `>=0.7` while the app has been on `0.5.1`), land that upgrade as its own PR. Native rebuild is required for Skia.

## Visual contract (moodboard + frozen brief)

- Exactly two overlapping hole cards as one packet.
- Far/dealer edge stays planted. Near edges lift together; right pinch corner leads slightly.
- Max extra rotate **16°**. Max corner rise **18%** of card height.
- Only rank/suit corners become readable. No third card, no HUD box, no full faces.
- Poses: rest → corner pinch (90–120 ms) → lift (180–240 ms, hold) → settle (180–240 ms, ≤8% overshoot).
- Peek does not start on touch-down. Call/Raise commit must not move hole cards.
- Reduced motion: no 3D bend, no overshoot; 120 ms opacity on index plates; same info and outcomes.
- Glove is 1930s rubber-hose, stepped poses, not a photoreal morph.

---

## Phase 1 — Gesture (the pull)

Files: `TableGestures.tsx`, `PeekAndPitchTemplate.tsx`, `peekMotion.ts`, `peekMotion.test.ts`.

Shared values: `peekArmed`, `peekDragY`, `peekProgress`, `peekPhase`, `touchRegion`, `peekAnnounced`.

Mapping after hold (Y down is positive):

`d = clamp(translationY - deadZone, 0, pullRange)`  
`x = d / pullRange`  
`p = x^1.25`

Dead zone 4–6 pt. Pull range ~28–36% of card height. Clamp, do not extrapolate.

Micro-tasks:

1. Measured card-packet hit rect as a shared value.
2. Pure worklets: clamp, region class, pull normalize.
3. Hold gate + downward-only pull; Fold/Check/Call/Raise unchanged.
4. `onPeeked` once at reveal threshold; `onPeekHold` only for optional SFX/haptic.
5. Finalize on cancel/fail/disabled so Peek cannot stick.
6. Remove `commit.value * cardHeight` translation from card travel (Call/Raise must leave cards planted).
7. Tests: dead zone, clamp, monotonic progress, region priority, negative-Y reject.
8. Accessibility Peek action that reveals the same information without dragging.

---

## Phase 2 — Bend / arch

Files: `cardBendMath.ts`, `cardBendMath.test.ts`, `BentCardMesh.tsx`, `HoleCards.tsx`, `feltPlane.ts`.

Local coords: `u` left→right across packet, `v` far/dealer→near/player. Grid **5×7** (35 verts, 48 tris). Static UVs and indices.

Circular arc (preserve card-stock length):

`θ(u) = p · 16° · lead(u)`  
`R = L / max(θ, ε)`  
`y(v) = R·sin(vθ)`  
`z(v) = R·(1-cos(vθ))`  
flat limit: `y=vL, z=0`

`lead(u)` ≈ 0.90 left → 1.00 right pinch. Apply existing overlap, then felt-plane pitch + perspective. Same projector for cards, masks, shadows, glove anchors.

Start with `Vertices + ImageShader`, not a runtime shader.

Delete the eight-band renderer only after visual, reduced-motion, and perf gates pass.

---

## Phase 3 — Hand / pinch

Files: `HeroHand.tsx`, `BarrierHand.tsx`, `gloveLayout.ts`, `assets/tables/hero-glove-*`.

Glove follows **projected near-right mesh vertex + tangent**, not a second `cornerPeel` curve.

**Art requirement:** split Pinch and Lift into registered back-finger and front-thumb layers (same canvas, same contact UV). Draw: back fingers → Skia packet → thumb/palm. A single PNG cannot occlude correctly.

Poses: Rest until armed → Rest→Pinch 90–120 ms (rise ≤6%) → Pinch→Lift 180–240 ms → hold Lift with no idle float → reverse on settle. Narrow crossfades; no three ghost hands.

Barrier glove: one shield pose while peeking. Do not mirror every bend delta.

---

## Phase 4 — Reveal, light, shadow

Remove `PeekHud`. Rank/suit stay card-local.

`reveal = smoothstep(0.18, 0.62, p)`. Curved clip between planted plane and lifted edge, intersected with a max corner crop so full faces cannot leak. Right card first; left delayed/smaller. `10` and all suits must stay complete.

Lambert from arc normal `φ=vθ`; cream/tobacco palette; illustrated, not glossy. One packet shadow + tiny glove contact shadow. Bound blur; drop blur on low-tier if GPU-hot.

Reduced motion as specified above.

---

## Validation

Invariants: far edge `z=0`; θ≤16°; rise≤18%; arc length preserved; no flipped tris/NaNs; packet stays one pair.

Interaction: no Peek on touch-down, stack, deal/resolve, or after Fold wins. Always return to rest. Screen reader alternative. Same contract on `CalibrationHarness` and `StagePlayScreen`.

Perf: mid-tier Android + iPhone, 3 s hold + 10 open/close cycles. p95 UI frame &lt; 16.7 ms on 60 Hz; no JS work during hold. Fill `docs/qa/peek-map-performance-baseline.md` with real FPS.

Rollout: Skia spike → math+tests behind a flag → two-card mesh + reveal with old renderer fallback → split-hand occlusion → integration tests → remove bands, plates, PeekHud, flag.

### Definition of done

Hold on the packet, pull toward the player, one C-curve under a registered cartoon pinch, two readable corners, short settle. No HUD, no JS frame loop, no Fold/Check/Call/Raise/a11y/reduced-motion regressions.

---

## Lessons from the discarded first attempt

- Worklets stayed at `0.5.1` after installing Skia `2.2.12`. Treat the Reanimated/Skia/Worklets spike as blocking; do not assume Expo Go is enough.
- Split glove PNGs were not in the repo; pose crossfade alone does not sell a pinch.
- Instant `withSpring(1)` on pan `onBegin` is forbidden by the frozen brief.
- `Gesture.Race(long-press peek, upward muck)` needs an explicit path to Fold **after** Peek is already armed.
- Do not mix this renderer rewrite with unrelated uncommitted chip work on the same branch.
