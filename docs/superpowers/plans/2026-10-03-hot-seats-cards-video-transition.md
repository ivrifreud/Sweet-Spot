# Hot Seats Cards and Video Transition Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live two-card hand fit the painted silhouettes cleanly, then replace the rejected fake camera motion with the supplied garden orbit video so a correct decision visibly moves the player into the next seat.

**Architecture:** First calibrate and approve a reusable `HeroCardStack` against a still 571×1024 table image. The two card faces sit inside exact painted card rectangles with a uniform black rim, the right card above the left, and the existing transparent thumb above both. Only after that visual checkpoint, add a feature-specific preloaded `expo-video` transition controller. The controller plays only the middle of the supplied clip—where the camera is outside the body—so changing card faces remains the responsibility of the live scene before and after the video.

**Tech Stack:** Expo 57, React Native 0.86, React 19, `expo-video`, Reanimated 4, Vitest, Python/Pillow for static calibration previews.

**Spec:** `docs/superpowers/specs/2026-09-29-hot-seats-design.md`

## Global Constraints
- Phone portrait only. Verify 375×667, 390×844, and 430×932.
- The table transition is the signature mechanic. Do not replace it with a tilted screenshot, a sliding cutout, or a generic page transition.
- One correct decision at seats 0–2 starts one transition; a wrong decision and the fourth correct decision do not.
- `storyEngine.ts` remains the authority for `arriving → card → deciding → swapping → arriving`.
- Gestures remain locked until the arrival card clears.
- Video is muted. Keep the existing `windSwoosh` sound and light haptic.
- Reduced motion never plays the orbit video; use the existing 180ms card fade.
- Do not alter the shared card PNGs. Peek and Pitch and other templates use them.
- Do not show the garden video in the casino skin. Casino uses the reduced/fallback transition until a matching casino clip is supplied.
- Do not edit Chips, scoring, explanations, arrival-card copy, or story validation.

## Locked Source Assets
- Annotated card-position reference supplied by the owner:
  `C:\Users\גיא\.cursor\projects\c-Users-Sweet-Spot-hot-seats-plan\assets\c__Users_____AppData_Roaming_Cursor_User_workspaceStorage_fd4bddde87bdbacc3968cd3ff46deeed_images_png_bennys_garden_spining_table-246b483c-7d31-4f22-ab2f-6d4092a003e6.jpg`
- Garden table plate: `my-expo-app/assets/hot-seats/bennys-garden.png`, 571×1024 RGBA.
- Casino table plate: `my-expo-app/assets/hot-seats/local-casino.jpg`, 571×1024 RGB.
- Thumb foreground: `my-expo-app/assets/hot-seats/garden-thumb.png`, 571×1024 RGBA. It aligns with both shipped table paintings.
- Card family: `my-expo-app/assets/tables/playing-cards/*.png`, 140×190. Reuse through `cardFaceArt`.
- Supplied garden transition:
  `C:\Users\גיא\Downloads\gemini_generated_video_93e47a5d.mp4`
  - 720×1280 portrait
  - H.264, 24fps
  - 10.01 seconds
  - Audio exists but must stay muted
  - Source time 0–1.5s shows blank foreground cards
  - Source time about 1.5–8.5s contains the pull-out, orbit, and entry
  - Source time after about 8.5s shows blank foreground cards again

## What Failed and Must Be Removed
- Moving a cutout of the left player onto the hero cards looked like a sticker moving across the felt.
- Rotating, translating, and scaling the whole still painting looked like the phone image tilting, not a camera orbiting the table.
- Three cream rectangular swoosh streaks did not create depth.
- Do not continue tuning `seatSwapPose.ts`; the premise is rejected.
- Do not overlay live cards throughout the moving video. A flat overlay cannot naturally preserve perspective and stay behind the baked thumb without a tracked per-frame matte. The useful middle of the clip does not need visible live card faces.

## Current Working-Tree Warning
The current branch has uncommitted rejected-tilt edits in:
- `my-expo-app/src/features/templates/hot-seats/HotSeatScene.tsx`
- `my-expo-app/src/features/templates/hot-seats/seatSwapPose.ts`
- `my-expo-app/lib/hot-seats/seatSwapPose.test.ts`

There is also unrelated untracked Python cache content under `.cursor/skills/.../__pycache__/`.

Do not use `git reset --hard`, `git checkout -- .`, or delete unrelated files. Replace the rejected motion deliberately during Task 4, then remove only the obsolete pose module and its test.

## File Structure
- Create `my-expo-app/src/features/templates/hot-seats/HeroCardStack.tsx`
  - Owns the two-card layering, uniform black rim, face inset, order, and accessibility labels.
- Modify `my-expo-app/src/features/templates/hot-seats/sceneLayout.ts`
  - Owns source-art card rectangles and maps them onto the phone.
- Create `my-expo-app/lib/hot-seats/heroCardLayout.test.ts`
  - Verifies centers, inset, order, and phone scaling.
- Create `my-expo-app/scripts/render-hot-seat-hand-preview.py`
  - Produces static visual proofs before app integration.
- Create `docs/superpowers/artifacts/hot-seats-card-fit-garden.png`
- Create `docs/superpowers/artifacts/hot-seats-card-fit-casino.png`
  - Approval images containing three sample hands each.
- Copy video to `my-expo-app/assets/hot-seats/garden-seat-swap.mp4`
  - Keep the original 720×1280 file; cue and speed are controlled at runtime.
- Create `my-expo-app/src/features/templates/hot-seats/hotSeatSwapVideoPlan.ts`
  - Pure timing/configuration logic.
- Create `my-expo-app/lib/hot-seats/hotSeatSwapVideoPlan.test.ts`
  - Tests cue timing, next-hand timing, completion, and fallback.
- Create `my-expo-app/src/features/templates/hot-seats/HotSeatSwapVideo.tsx`
  - Preloads and plays the local clip; no game rules.
- Modify `my-expo-app/src/features/templates/hot-seats/HotSeatScene.tsx`
  - Uses `HeroCardStack`; contains no fake camera transform.
- Modify `my-expo-app/src/features/templates/hot-seats/HotSeatsTemplate.tsx`
  - Starts the transition in `swapping`, changes the hidden live hand near landing, then calls `cameraLanded`.
- Modify `my-expo-app/src/features/templates/hot-seats/seatRail.ts`
  - Retain first-seat and reduced-motion values; remove the old 720ms fake-camera contract if no other consumer remains.
- Modify `my-expo-app/lib/hot-seats/storyEngine.test.ts`
  - Replace pose-specific presentation assertions with transition-routing assertions.
- Delete `my-expo-app/src/features/templates/hot-seats/seatSwapPose.ts`
- Delete `my-expo-app/lib/hot-seats/seatSwapPose.test.ts`
  - Only after no imports remain.

---

### Task 1: Build a static hand-calibration proof

**Files:**
- Create: `my-expo-app/scripts/render-hot-seat-hand-preview.py`
- Create: `docs/superpowers/artifacts/hot-seats-card-fit-garden.png`
- Create: `docs/superpowers/artifacts/hot-seats-card-fit-casino.png`

**Interfaces:**
- Consumes the two 571×1024 table plates, `garden-thumb.png`, and face PNGs.
- Produces review images only; it does not change app behavior.

**Measured outer card rectangles in source-art pixels:**

```python
OUTER_SLOTS = (
    # Left card; painted underneath.
    {"cx": 258, "cy": 858, "width": 136, "height": 196, "rotation": -13},
    # Right card; painted above left and below the thumb.
    {"cx": 333, "cy": 849, "width": 120, "height": 187, "rotation": 10},
)
FACE_INSET = 4  # source-art pixels on every local edge
```

The rectangles match the alpha-window corners:
- Left: approximately `(170,778)`, `(302,747)`, `(346,938)`, `(214,969)`.
- Right: approximately `(290,747)`, `(408,767)`, `(376,952)`, `(258,931)`.

The red lines in the owner image are explanatory only. Do not copy red pixels or treat them as the final border.

- [x] **Step 1: Implement a Pillow preview script**

The script must:
1. Build each card in local coordinates.
2. Draw a solid black outer card rectangle.
3. Paste the face at a 4px local inset, leaving a uniform black rim.
4. Rotate the complete outer-card layer around its center.
5. Composite left first, then right.
6. Composite `garden-thumb.png` last.
7. Produce a three-panel preview for `As/Kh`, `7c/8d`, and `Qd/Jc`.
8. Produce the same proof over garden and casino.

Use this data shape:

```python
SAMPLE_HANDS = (("As", "Kh"), ("7c", "8d"), ("Qd", "Jc"))
BLACK = (17, 23, 20, 255)  # artStyle projectorBlack
```

- [x] **Step 2: Run the preview generator**

Run:

```powershell
python my-expo-app/scripts/render-hot-seat-hand-preview.py
```

Expected:
- Two PNGs are written under `docs/superpowers/artifacts/`.
- All six hands use identical geometry.
- Right card overlaps left.
- Thumb covers the right card.
- No rank or suit is hidden by an accidental crop except where the painted thumb naturally occludes the face.

- [x] **Step 3: Inspect the previews at 100% and phone scale**

Generate or inspect at:
- Source: 571×1024
- 390×844 cover scale
- 375×667 cover scale
- 430×932 cover scale

Acceptance:
- The visible black rim is 4±1 source-art pixels on every exposed edge.
- No gray or white card pixel extends beyond the black silhouette.
- No large wedge of black remains between a face and its intended rim.
- The two cards do not form one merged white block.
- The casino’s baked ace/king do not leak around replacement cards.

- [ ] **Step 4: Stop for owner approval**

Embed both preview PNGs in chat. Do not start video integration or app card code until the owner explicitly approves the still hand.

- [ ] **Step 5: Commit the calibration proof after approval**

```powershell
git add my-expo-app/scripts/render-hot-seat-hand-preview.py docs/superpowers/artifacts/hot-seats-card-fit-*.png
git commit -m "Hot Seats: calibrate the held card artwork"
```

---

### Task 2: Ship the approved two-card stack in the live scene

**Files:**
- Create: `my-expo-app/src/features/templates/hot-seats/HeroCardStack.tsx`
- Modify: `my-expo-app/src/features/templates/hot-seats/sceneLayout.ts`
- Modify: `my-expo-app/src/features/templates/hot-seats/HotSeatScene.tsx`
- Create: `my-expo-app/lib/hot-seats/heroCardLayout.test.ts`

**Interfaces:**
- `HeroCardStack` consumes:

```ts
type HeroCardStackProps = {
  cards: readonly [CardCode, CardCode];
  outerSlots: readonly [HoleSlotFrame, HoleSlotFrame];
  art: SceneFrame;
  opacity: SharedValue<number>;
  skin: HotSeatSkin;
};
```

- `sceneLayout.ts` produces outer card slots plus a scaled inset:

```ts
type HoleSlotFrame = SceneFrame & {
  rotation: number;
  faceInset: number;
};
```

- [ ] **Step 1: Write failing geometry tests**

Tests must assert:

```ts
expect(garden.holeSlots[0]).toMatchObject({ rotation: -13 });
expect(garden.holeSlots[1]).toMatchObject({ rotation: 10 });
expect(garden.holeSlots[0].faceInset).toBeCloseTo(
  4 * garden.art.width / 571
);
expect(garden.holeSlots[0].x + garden.holeSlots[0].width / 2)
  .toBeCloseTo(garden.art.x + 258 * garden.art.width / 571);
expect(garden.holeSlots[1].x + garden.holeSlots[1].width / 2)
  .toBeCloseTo(garden.art.x + 333 * garden.art.width / 571);
```

Run:

```powershell
cd my-expo-app
npx vitest run lib/hot-seats/heroCardLayout.test.ts
```

Expected: FAIL because `faceInset` and `HeroCardStack` do not exist.

- [ ] **Step 2: Add the approved geometry to `sceneLayout.ts`**

Use one geometry for both skins unless the approved casino preview proves a separate outer shell is required. Do not preserve the current larger casino slots merely because they exist; they were introduced to cover baked cards and were not visually approved.

Store geometry in source-art pixels, then scale through `layout.art`. Keep the original centers and rotations. Scale `FACE_INSET_ART = 4` with the art.

- [ ] **Step 3: Implement `HeroCardStack`**

For each card:
- Position an outer wrapper at the measured slot.
- Rotate the wrapper, not the face independently.
- Give the wrapper `projectorBlack`.
- Set `overflow: 'hidden'`.
- Inset the face by `slot.faceInset` on all four local edges.
- Use `resizeMode="stretch"` inside the approved perspective rectangle.
- Render index 0 first and index 1 second.

Required layer order:

Garden:

```text
HeroCardStack
bennys-garden.png (transparent card window)
garden-thumb.png
```

Casino:

```text
local-casino.jpg
HeroCardStack (black shell fully hides the painted ace/king)
garden-thumb.png
```

Do not bake a particular hand into a new plate.

- [ ] **Step 4: Replace `HoleCard` in `HotSeatScene.tsx`**

Remove the per-card absolute `<Image>` helper after `HeroCardStack` owns the hand. Keep community cards unchanged.

- [ ] **Step 5: Run tests and inspect the actual preview**

Run:

```powershell
npx vitest run lib/hot-seats/heroCardLayout.test.ts lib/hot-seats/sceneLayout.test.ts
npx expo start --dev-client --offline
```

Verify all fixture hands in Garden and Casino on 390×844. The app must match the approved Pillow preview, not merely pass coordinate tests.

- [ ] **Step 6: Commit the live hand**

```powershell
git add my-expo-app/src/features/templates/hot-seats/HeroCardStack.tsx my-expo-app/src/features/templates/hot-seats/sceneLayout.ts my-expo-app/src/features/templates/hot-seats/HotSeatScene.tsx my-expo-app/lib/hot-seats/heroCardLayout.test.ts
git commit -m "Hot Seats: fit live cards to the painted hand"
```

---

### Task 3: Define and test the video cue contract

**Files:**
- Create: `my-expo-app/src/features/templates/hot-seats/hotSeatSwapVideoPlan.ts`
- Create: `my-expo-app/lib/hot-seats/hotSeatSwapVideoPlan.test.ts`
- Copy: `C:\Users\גיא\Downloads\gemini_generated_video_93e47a5d.mp4`
  to `my-expo-app/assets/hot-seats/garden-seat-swap.mp4`

**Interfaces:**

```ts
export const GARDEN_SWAP_CUE = {
  sourceInSeconds: 1.5,
  landingStartSeconds: 8.15,
  nextHandSeconds: 8.15,
  sourceOutSeconds: 8.5,
  playbackRate: 4,
  revealMs: 100,
  landingMs: 100,
  timeoutMs: 500,
} as const;

export type SwapVideoEvent =
  | 'show-video'
  | 'show-next-hand'
  | 'finish'
  | 'fallback';
```

At 4×, source 1.5–8.5 takes 1.75 seconds. This is deliberately longer than the rejected 720ms tilt because the clip must communicate pull-out, orbit, and possession. Do not play the full 10 seconds.

- [ ] **Step 1: Write failing pure timing tests**

Test:
- Garden, normal motion, ready video → video route.
- Casino → fallback route.
- Reduced motion → 180ms fade route.
- Wrong/final-seat completion never asks for a video route; that remains enforced by `storyEngine`.
- `nextHandSeconds` is before `sourceOutSeconds`.
- Runtime duration is `(8.5 - 1.5) / 4 = 1.75`.

- [ ] **Step 2: Copy and audit the video**

Use a filename without spaces. Confirm:

```powershell
git status --short my-expo-app/assets/hot-seats/garden-seat-swap.mp4
```

Do not edit the owner’s Downloads copy.

- [ ] **Step 3: Implement the pure cue module**

Keep all source timestamps and route decisions out of React components so tests can lock them.

- [ ] **Step 4: Run and commit**

```powershell
npx vitest run lib/hot-seats/hotSeatSwapVideoPlan.test.ts
git add my-expo-app/assets/hot-seats/garden-seat-swap.mp4 my-expo-app/src/features/templates/hot-seats/hotSeatSwapVideoPlan.ts my-expo-app/lib/hot-seats/hotSeatSwapVideoPlan.test.ts
git commit -m "Hot Seats: define the garden seat-swap video cue"
```

---

### Task 4: Build a preloaded, cue-driven transition player

**Files:**
- Create: `my-expo-app/src/features/templates/hot-seats/HotSeatSwapVideo.tsx`
- Test: `my-expo-app/lib/hot-seats/hotSeatSwapVideoPlan.test.ts`

**Interfaces:**

```ts
type HotSeatSwapVideoProps = {
  active: boolean;
  generation: string;
  skin: HotSeatSkin;
  reducedMotion: boolean;
  onCovered: () => void;
  onComplete: () => void;
  onUnavailable: () => void;
};
```

- `onCovered` fires once at source time 8.15s, immediately before the landing crossfade. The hidden live scene changes to the next hand then.
- `onComplete` fires after source time reaches 8.5s and the 100ms landing crossfade ends.
- `onUnavailable` fires once on load error or a 500ms cue timeout.

- [ ] **Step 1: Preload without autoplay**

Use `useVideoPlayer` directly. Do not use `useReadyVideo`, because that hook auto-plays as soon as the file is ready.

Initialization:

```ts
const player = useVideoPlayer(GARDEN_SWAP_VIDEO, (next) => {
  next.loop = false;
  next.muted = true;
  next.playbackRate = GARDEN_SWAP_CUE.playbackRate;
  next.timeUpdateEventInterval = 0.05;
});
```

Mount `VideoView` for the life of `HotSeatsTemplate`, behind an opacity-0 overlay when inactive. On `readyToPlay`, pause and seek to `sourceInSeconds`.

- [ ] **Step 2: Start on an explicit `active` edge**

When `active` changes false→true:
1. Confirm Garden, normal motion, and ready status.
2. Seek to 1.5s.
3. Play existing `windSwoosh`.
4. Fire the light haptic.
5. Start playback.
6. Reveal the video over 100ms only after a frame exists.

Use `VideoView` with:

```tsx
<VideoView
  player={player}
  nativeControls={false}
  contentFit="cover"
  playsInline
  surfaceType="textureView" // Android only; required for opacity stacking
/>
```

- [ ] **Step 3: Handle source-time events**

Subscribe with `useEventListener`:
- `timeUpdate`: fire `onCovered` once at ≥8.15s and immediately fade video opacity from 1→0 over 100ms. This starts before the generated blank foreground cards return.
- `timeUpdate`: at ≥8.5s, pause and begin landing.
- `statusChange`: route errors to `onUnavailable`.
- `playingChange`: arm/cancel the 500ms cue timeout.

After the live next hand is underneath, fade/cover the last video frame for 100ms, hide the overlay, seek back to 1.5s, then call `onComplete`.

- [ ] **Step 4: Guarantee single completion**

Use refs for:
- `generation`
- `covered`
- `completed`
- `cueTimeout`

Stale events from seat N must not complete seat N+1.

- [ ] **Step 5: Add accessibility and lifecycle behavior**

- `pointerEvents="none"`
- Decorative video hidden from accessibility.
- Pause on unmount.
- On app interruption or playback error, invoke fallback once.
- No black frame: keep the live table visible until the video has a renderable frame.

- [ ] **Step 6: Commit**

```powershell
git add my-expo-app/src/features/templates/hot-seats/HotSeatSwapVideo.tsx
git commit -m "Hot Seats: preload and cue the garden orbit clip"
```

---

### Task 5: Replace the rejected motion with the video transition

**Files:**
- Modify: `my-expo-app/src/features/templates/hot-seats/HotSeatsTemplate.tsx`
- Modify: `my-expo-app/src/features/templates/hot-seats/HotSeatScene.tsx`
- Modify: `my-expo-app/src/features/templates/hot-seats/seatRail.ts`
- Modify: `my-expo-app/lib/hot-seats/storyEngine.test.ts`
- Delete: `my-expo-app/src/features/templates/hot-seats/seatSwapPose.ts`
- Delete: `my-expo-app/lib/hot-seats/seatSwapPose.test.ts`

**Data flow:**

```text
correct decision at seat 0–2
→ storyEngine phase = swapping
→ HotSeatSwapVideo active
→ source reaches 8.15s
→ handAhead = true under the video
→ source reaches 8.5s
→ video hides
→ cameraLanded increments seatIndex
→ arriving
→ arrival card
→ card clears
→ gestures unlock
```

- [ ] **Step 1: Add failing integration assertions**

Keep pure story tests asserting:
- Correct non-final decision enters `swapping`.
- Wrong decision enters `explaining`.
- Fourth correct decision enters `explaining`.
- `cameraLanded` only advances from `swapping`.

Remove assertions about `swapPose`, screen rotation, or 720ms camera geometry.

- [ ] **Step 2: Remove fake transforms and streaks from `HotSeatScene`**

The live scene must be completely still. Remove:
- `cameraStyle`
- `CameraSwoosh`
- `SwooshStreak`
- `SWOOSH_LANES`
- cream streak styles
- `swap` and `swapEnabled` props

Keep `holeFade` only for reduced-motion/fallback hand changes.

- [ ] **Step 3: Route normal Garden swapping through video**

Add local transition state to `HotSeatsTemplate`:

```ts
type SwapPresentation = 'idle' | 'video' | 'fallback';
```

When `play.phase === 'swapping'`:
- Garden + normal motion starts `video`.
- Casino, reduced motion, or video failure starts `fallback`.

Pass:

```tsx
generation={`${story.id}-${play.seatIndex}`}
```

to the player.

- [ ] **Step 4: Preserve card ownership during the handoff**

Before `onCovered`, the hidden live table renders `story.seats[play.seatIndex].holeCards`.
At `onCovered` (source time 8.15s), set `handAhead=true`; the hidden table renders `story.seats[play.seatIndex + 1].holeCards` before video opacity drops.
At `onComplete`, call `cameraLanded`, then set `handAhead=false`.

The next live frame must already be ready before the video is removed.

- [ ] **Step 5: Implement fallback and reduced motion**

Reuse a 180ms two-half fade:
- 90ms current hand → opacity 0
- Switch `handAhead=true`
- 90ms opacity 0 → 1
- Call `cameraLanded`

Do not invoke any still-image rotation.

- [ ] **Step 6: Delete the obsolete pose module**

Confirm:

```powershell
rg "seatSwapPose|CameraSwoosh|swapPose" my-expo-app
```

Expected: no production imports or tests.

- [ ] **Step 7: Run Hot Seats tests and commit**

```powershell
npx vitest run lib/hot-seats
git add my-expo-app/src/features/templates/hot-seats my-expo-app/lib/hot-seats
git commit -m "Hot Seats: enter the next seat through the orbit video"
```

---

### Task 6: Phone verification and performance gate

**Files:**
- Modify only files that fail the checks above.

- [ ] **Step 1: Verify the live card hand first**

On 390×844:
- Open Garden.
- Inspect at least three different two-card combinations.
- Confirm uniform black rim.
- Confirm right-over-left order.
- Confirm thumb-over-right order.
- Open Casino and confirm no baked ace/king leaks.

- [ ] **Step 2: Verify all transition branches**

Garden:
- Correct seat 0, 1, and 2: one video each.
- Wrong answer: no video.
- Correct seat 3: no video; explanation opens.
- Video ends with next seat’s real cards.
- Arrival card opens only after video is gone.

Casino:
- Correct seat 0–2: 180ms fallback fade, never garden footage.

Reduced motion:
- Garden and casino both use the 180ms fade.

- [ ] **Step 3: Verify first-play readiness**

Restart the app and trigger the first correct decision.
Acceptance:
- No black frame.
- No delayed audio with a still screen.
- No replay of the previous transition’s end frame.
- If video is not ready within 500ms, fallback begins and play continues.

- [ ] **Step 4: Verify interruption safety**

During the transition:
- Background and foreground the app.
- Navigate away from preview.
- Restart the story.

Acceptance:
- Player pauses safely.
- No stale callback advances two seats.
- No gestures unlock during `swapping`.

- [ ] **Step 5: Run final checks**

```powershell
cd my-expo-app
npx vitest run lib/hot-seats lib/video
npx tsc --noEmit -p .
```

Report unrelated existing type errors separately. Do not “fix” adjacent systems.

- [ ] **Step 6: Final review**

The feature is accepted only if:
- The still hand was approved before video work.
- The transition reads as leaving one body, circling the table, and entering the player who began on screen-left.
- The first and last visible live frames use dynamic story cards.
- No blank foreground cards are exposed from the clip.
- No fake tilt or sliding-player code remains.

## Required Visual Approval Order
1. Garden static card preview.
2. Casino static card preview.
3. Live phone hand in both skins.
4. Garden video transition.
5. Reduced-motion and casino fallback.

Do not collapse these into one final review. The card geometry must be approved before video implementation proceeds.
