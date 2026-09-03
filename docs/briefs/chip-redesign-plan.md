# Chip redesign — implementation plan

Replaces the teal/gold 3D chip with the approved **cream clay chip**: cream/tan body,
brick-red rim inserts, thick dark ink outline, red-and-ink spade medallion, aged paper grain.

Three surfaces change: the splash chip rain, the Peek and Pitch hero stack, and the
three Chip lives in the top bar. The confetti chip in the decision-feedback overlay
changes too, because it shares the asset being deleted.

**The sprites already exist and are already transparent.** Do not regenerate them.
Task 1 onward is pure code.

---

## 0. Read this first

### Hard invariants

1. **Do not touch `ChipStackTarget.tsx` or `TableGestures.tsx`.** They own all four
   Peek and Pitch actions — Raise, Call, Fold, Check. This redesign is presentational.
   The gesture layer is a separate absolutely-positioned view (`stackHitLayer`,
   `zIndex: 55`) sitting on top of the art (`stackHolder`, `zIndex: 8`,
   `pointerEvents="none"`), so the visuals can change freely without touching input.
2. **Delete the old PNGs last (Task 7).** Deleting them before Tasks 2–6 land breaks
   the Metro bundler, because five files still `require()` them.
3. **Do not invent colours.** Everything comes from `theme/artStyle.ts` or is baked
   into the sprites.
4. **No new gestures, no renames.** "The Peek and Pitch" and "Badges" keep their names.
   Bankroll, Gold Coins, Chips, and Elo logic are untouched.
5. Phone app only. Touch targets stay ≥44pt; no hover, no `cursor-pointer`.

### The sprite set — already committed

All four are in `my-expo-app/assets/brand/chips/`. None carries a baked background,
ground plane, or drop shadow. The three round sprites are keyed to full transparency
with soft feathered edges and corner alpha 0. `chip-edge.png` is the exception: it is a
rectangular slice cropped inside its own ink line, so it is 100% opaque by design —
a semi-transparent border row would show as a light seam between stacked chips.

| File | Size | Role |
| --- | --- | --- |
| `chip-face.png` | 490×512 | Top-down face. Stack caps, HUD lives, chips at rest in the pot. |
| `chip-face-empty.png` | 494×512 | Spent HUD life slot — dark inked socket, same silhouette. |
| `chip-edge.png` | 512×81 | One chip's side wall. Repeats vertically to build stack thickness. Fully opaque so stacked slices never seam. |
| `chip-3q.png` | 512×450 | Three-quarter view with visible thickness. Chips in the air. |

They were produced by `my-expo-app/scripts/key-chip-sprite.py`, which keys a
magenta-backed render to alpha. To re-cut or add a pose later:

```bash
python my-expo-app/scripts/key-chip-sprite.py IN.png OUT.png --max-size 512
python my-expo-app/scripts/key-chip-sprite.py my-expo-app/assets/brand/chips/chip-face.png --check-only
```

`--check-only` prints the alpha breakdown and the four corner alphas. Any new *round*
chip sprite must report corner alpha `[0, 0, 0, 0]`; pass `--inset 4` for slices that
tile flush, like the edge.

### Verify after every task

```bash
cd my-expo-app
npx tsc --noEmit
npm run lint
npm run test
```

`npm run test` is logic-only (`lib/track/chips.ts`, `lib/chip-stack/`) and no test
asserts on chip art, so a new failure means something real broke.

**Known-failing baseline — do not try to fix these.** On the branch this plan was
written against, `npx tsc --noEmit` already reports two pre-existing errors that have
nothing to do with chips:

```
lib/track/chipStack.test.ts(3,10): error TS2305: Module '"./chipStack"' has no exported member 'CHIP_REGEN_MS'.
lib/track/chipStack.test.ts(3,25): error TS2305: Module '"./chipStack"' has no exported member 'resolveChipStack'.
```

Success means **exactly these two and nothing else**. If a third error appears, it is yours.

`npm run test` has a matching pre-existing failure from the same missing export —
`lib/track/chipStack.test.ts`, 3 failed / 111 passed, 17 of 18 files green. Success means
that count is unchanged.

### What it should look like

`docs/moodboard/references-art-style/chip-redesign-target.png` is a composited preview of
the stack geometry, the throw arc, and the HUD lives built from the real sprites using the
exact constants in this plan. Match it. The other two references still apply:
`pitch-glove-reach-chip-stacks.png` for stack clustering and
`hud-chip-lives-hearts-filled-empty.png` for filled-versus-spent lives.

---

## Task 1 — Shared sprite tokens

**Goal:** one module every chip surface imports, so nobody has to re-derive aspect ratios.

**Create `my-expo-app/theme/chipArt.ts`:**

```ts
/**
 * Sweet Spot chip sprite set — cream clay body, brick-red rim inserts, inked
 * spade medallion. Every chip drawn anywhere in the app comes from here.
 *
 * Sprites carry no background, ground plane, or drop shadow. Contact shadows are
 * drawn in the UI so they can react to height and lighting.
 */
export const chipArt = {
  /** Top-down face. Stack caps, HUD lives, chips at rest in the pot. */
  face: require('../assets/brand/chips/chip-face.png'),
  /** Spent HUD life slot — dark inked socket, same silhouette as `face`. */
  faceEmpty: require('../assets/brand/chips/chip-face-empty.png'),
  /** One chip's side wall. Repeat vertically to build stack thickness. */
  edge: require('../assets/brand/chips/chip-edge.png'),
  /** Three-quarter view with visible thickness. Chips in the air. */
  threeQuarter: require('../assets/brand/chips/chip-3q.png'),
} as const;

/** `chip-face.png` is 490x512 — height as a multiple of width. */
export const CHIP_FACE_ASPECT = 512 / 490;

/** `chip-face-empty.png` is 494x512. */
export const CHIP_EMPTY_ASPECT = 512 / 494;

/** `chip-3q.png` is 512x450 — height as a multiple of width. */
export const CHIP_3Q_ASPECT = 450 / 512;

/**
 * `chip-edge.png` is 512x81 — one chip's thickness as a fraction of its
 * diameter. Drives how fast a stack grows per chip.
 */
export const CHIP_EDGE_RATIO = 81 / 512;

/**
 * Vertical squash for a face lying flat on the felt, so a chip on the table
 * reads as an ellipse in the table's perspective instead of a coin facing camera.
 */
export const CHIP_FELT_SQUASH = 0.46;
```

**Verify:** `npx tsc --noEmit` passes. Nothing imports it yet.

---

## Task 2 — Chip lives in the top bar

**Goal:** the three lives become clean cream chips; a spent life leaves a dark inked
socket behind rather than a faded chip on a grey pill.

Reference: `docs/moodboard/references-art-style/hud-chip-lives-hearts-filled-empty.png`
— filled reads bright, spent reads as a dark silhouette in the same slot.

The counting logic in `lib/track/chips.ts` is already correct. **Do not change it.**

**Replace the whole body of `my-expo-app/components/track/LifeChips.tsx`:**

```tsx
import { Image, StyleSheet, View } from 'react-native';

import { MAX_CHIPS, chipSlots } from '../../lib/track/chips';
import { CHIP_FACE_ASPECT, chipArt } from '../../theme/chipArt';

type Props = {
  remaining: number;
  size?: number;
};

export function LifeChips({ remaining, size = 26 }: Props) {
  const slots = chipSlots(remaining);
  const burned = MAX_CHIPS - remaining;
  const height = size * CHIP_FACE_ASPECT;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        burned === 0
          ? `${remaining} chips remaining`
          : `${remaining} chips remaining, ${burned} burned`
      }
      style={styles.row}>
      {slots.map((filled, index) => (
        <Image
          key={index}
          source={filled ? chipArt.face : chipArt.faceEmpty}
          resizeMode="contain"
          style={{ width: size, height, marginLeft: index > 0 ? 5 : 0 }}
          accessibilityElementsHidden
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
});
```

What this removes on purpose: the per-slot wrapper `View`, the `emptySlot` grey
rounded rectangle, and the `opacity: 0.22` fade. The empty sprite carries that job now.

**Contrast fix in `my-expo-app/components/track/TrackHud.tsx`.** The other capsules are
cream, and a cream chip on a cream capsule has almost no separation. Give the lives
capsule a dark fill — the avatar frame already establishes a dark plate in this bar:

```ts
  chipCapsule: {
    flexGrow: 0,
    flexShrink: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
```

**Verify:**

- Three cream chips at full lives; the ink outline reads clearly at both `size` values
  (`22` compact, `26` regular).
- Burn one life → the rightmost slot becomes a dark socket, the row does not reflow,
  and the two remaining chips do not move.
- Burn all three → three dark sockets, still legible against the capsule.
- The `accessibilityLabel` still announces `"2 chips remaining, 1 burned"`.

**Known risk.** The face sprite carries a lot of detail — two concentric rings, a dashed
inner ring, six rim inserts, and the spade. In the composited preview it reads at 26px but
it is busy. If it turns to mush on a real phone, do **not** hand-tune the component: cut a
simplified HUD variant instead, with the dashed ring dropped and a bolder spade, and add it
to `chipArt` as `faceHud`. Generate it on a magenta field and key it with the same script.

---

## Task 3 — Splash chip rain

**Goal:** falling chips use the new 3/4 sprite and tumble like discs in 3D rather than
spinning like flat stickers.

Edit `my-expo-app/components/splash/FallingChips.tsx`. This one file feeds
`SplashScreen`, `AuthScreen`, and `LevelRevealScreen`, so all three update at once.

**3.1** Swap the import. Delete line 13 (`const CHIP_IMAGE = require(...)`) and add:

```ts
import { CHIP_3Q_ASPECT, chipArt } from '../../theme/chipArt';
```

Also add `useReducedMotion` to the existing `react-native-reanimated` import list.

**3.2** In `FallingChip`, add a tumble driver next to the existing `spin`:

```ts
  const tumble = useSharedValue(0);
  const reducedMotion = useReducedMotion();
```

and inside the existing `useEffect`, alongside the `spin.value` assignment:

```ts
    tumble.value = withDelay(
      chip.delay,
      withRepeat(withTiming(1, { duration: chip.duration * 0.42 }), -1, false)
    );
```

Add `tumble` to the effect's dependency array.

**3.3** In the `useAnimatedStyle`, add the edge-on squash. Keep the existing gravity
maths untouched:

```ts
    // One edge-on moment per revolution: a flat disc turning in 3D, not a
    // sticker rotating in the picture plane.
    const face = Math.abs(Math.cos(tumble.value * Math.PI));
    const scaleX = reducedMotion ? 1 : 0.34 + 0.66 * face;

    return {
      transform: [
        { translateY: y },
        { translateX: xDrift },
        { rotate: `${reducedMotion ? 0 : spin.value}deg` },
        { scaleX },
      ],
      opacity,
    };
```

**3.4** Size the image to the sprite's real aspect so it stops letterboxing inside a
square box:

```tsx
      <Image
        source={chipArt.threeQuarter}
        style={{ width: chip.size, height: chip.size * CHIP_3Q_ASPECT }}
        resizeMode="contain"
        accessibilityElementsHidden
      />
```

**Verify:**

- Splash, Auth, and Level Reveal all show cream chips falling, accelerating downward.
- No dark box, halo, or magenta fringe around any chip against the splash art.
- Each chip visibly flattens to an edge once per turn.
- With Reduce Motion on, chips still fall but do not spin or flatten.

---

## Task 4 — Confetti chip in decision feedback

**Goal:** keep the correct-answer confetti working after `poker-chip-sm.png` is deleted.

Edit `my-expo-app/src/features/decision-feedback/DecisionFeedbackOverlay.tsx`.

Replace line 38 (`const CHIP = require('../../../assets/brand/poker-chip-sm.png');`)
with an import at the top of the import block:

```ts
import { CHIP_3Q_ASPECT, chipArt } from '../../../theme/chipArt';
```

Then in `ConfettiShape`, update the `chip` branch:

```tsx
  if (particle.kind === 'chip') {
    const width = particle.size + 10;
    return (
      <Image
        source={chipArt.threeQuarter}
        style={{ width, height: width * CHIP_3Q_ASPECT }}
        accessibilityElementsHidden
      />
    );
  }
```

Leave the `foil`, `ribbon`, and `pip` branches and all confetti physics alone.

**Verify:** answer a spot correctly — confetti fires, chip particles are cream, no
crash, no missing-asset warning in the Metro log.

---

## Task 5 — Peek and Pitch hero stack

The largest task. Split into 5a–5d and verify after each. Nothing here touches
`ChipStackTarget.tsx` or `TableGestures.tsx`, so Raise, Call, Fold, and Check keep
working by construction.

### What the new stack is

A **2.5D column**: a run of `chip-edge.png` slices stacked bottom-up with one squashed
`chip-face.png` capping the top, plus a contact shadow drawn in the UI. Three columns of
different heights cluster together, matching
`docs/moodboard/references-art-style/pitch-glove-reach-chip-stacks.png`.

The stack splits into two groups:

- the **planted base**, which stays on the felt and only compresses under the thumb;
- the **held chips**, the top couple of chips that lift off and follow the finger.

That split is what reads as picking chips up. Both groups are driven by the `press`,
`dragX`, and `dragY` shared values the gesture layer **already** sets — no new plumbing.

### 5a — Sprite and column primitives

**Delete `my-expo-app/src/features/templates/peek-and-pitch/components/Chip.tsx`**
after 5b and 5c stop importing it. Its two importers are `ChipStack.tsx` and `ChipToss.tsx`.

**Create `.../peek-and-pitch/components/ChipSprite.tsx`:**

```tsx
import { Image, type ImageStyle, type StyleProp } from 'react-native';

import {
  CHIP_3Q_ASPECT,
  CHIP_FACE_ASPECT,
  chipArt,
} from '../../../../../theme/chipArt';

export type ChipView = 'face' | 'threeQuarter';

type ChipSpriteProps = {
  /** Chip diameter in px. */
  size: number;
  view?: ChipView;
  rotate?: number;
  style?: StyleProp<ImageStyle>;
};

/** One chip from the shared sprite set. Callers draw their own contact shadow. */
export function ChipSprite({ size, view = 'face', rotate = 0, style }: ChipSpriteProps) {
  const aspect = view === 'face' ? CHIP_FACE_ASPECT : CHIP_3Q_ASPECT;

  return (
    <Image
      source={view === 'face' ? chipArt.face : chipArt.threeQuarter}
      resizeMode="contain"
      style={[
        { width: size, height: size * aspect },
        rotate ? { transform: [{ rotate: `${rotate}deg` }] } : null,
        style,
      ]}
      accessibilityElementsHidden
    />
  );
}
```

**Create `.../peek-and-pitch/components/ChipColumn.tsx`:**

```tsx
import { Image, StyleSheet, View } from 'react-native';

import {
  CHIP_EDGE_RATIO,
  CHIP_FELT_SQUASH,
  chipArt,
} from '../../../../../theme/chipArt';

/** Thickness of one chip in a column, in px. */
export function chipEdgeHeight(size: number) {
  return Math.max(3, size * CHIP_EDGE_RATIO);
}

/** Height of the squashed face capping a column, in px. */
export function chipCapHeight(size: number) {
  return size * CHIP_FELT_SQUASH;
}

/** Total drawn height of a column, in px. */
export function chipColumnHeight(size: number, count: number) {
  return chipCapHeight(size) + Math.max(0, count) * chipEdgeHeight(size);
}

type ChipColumnProps = {
  /** Chip diameter in px. */
  size: number;
  /** Chips still in this column. */
  count: number;
  /** Slight lean so clustered columns do not look machine-stacked. */
  rotate?: number;
  /** Set false for chips in hand, which cast their shadow elsewhere. */
  grounded?: boolean;
};

/**
 * A 2.5D column: side-wall slices stacked bottom-up, one squashed face on top.
 * The bottom slice sits on the felt — the column never floats.
 */
export function ChipColumn({ size, count, rotate = 0, grounded = true }: ChipColumnProps) {
  const chips = Math.max(0, count);
  const edge = chipEdgeHeight(size);
  const cap = chipCapHeight(size);

  return (
    <View
      style={{
        width: size,
        height: chipColumnHeight(size, chips),
        transform: [{ rotate: `${rotate}deg` }],
      }}>
      {grounded ? (
        <View
          style={[
            styles.shadow,
            {
              left: -size * 0.03,
              width: size * 1.06,
              height: cap * 0.66,
              bottom: -cap * 0.16,
            },
          ]}
        />
      ) : null}

      {Array.from({ length: chips }).map((_, index) => (
        <Image
          key={index}
          source={chipArt.edge}
          resizeMode="stretch"
          style={[styles.layer, { width: size, height: edge, bottom: index * edge }]}
          accessibilityElementsHidden
        />
      ))}

      <Image
        source={chipArt.face}
        resizeMode="stretch"
        style={[
          styles.layer,
          { width: size, height: cap, bottom: chips * edge - cap * 0.1 },
        ]}
        accessibilityElementsHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(10,14,12,0.42)',
  },
  layer: {
    position: 'absolute',
    left: 0,
  },
});
```

`resizeMode="stretch"` is deliberate on both the slices and the cap — `contain` would
letterbox instead of squashing, and the squash is what creates the perspective.

**Verify:** `npx tsc --noEmit` passes. Not rendered yet.

### 5b — Rewrite the stack

Replace the whole body of `.../peek-and-pitch/components/ChipStack.tsx`. **Keep the
exported names `ChipStack` and `CHIP_SIZE` and keep the props identical** — that way
`PeekAndPitchTemplate.tsx` and `BarrierHand.tsx` need no changes.

```tsx
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { artStyle } from '../../../../../theme/artStyle';
import { ChipColumn, chipColumnHeight } from './ChipColumn';

export const CHIP_SIZE = 44;

/** Chips the hero lifts off the stack while committing a decision. */
export const HELD_CHIPS = 2;

/**
 * Clustered columns, tallest at the back, so the hero stack reads like the
 * moodboard pitch reference instead of one machine-perfect tower.
 */
const COLUMNS: { chips: number; lean: number }[] = [
  { chips: 8, lean: -2 },
  { chips: 5, lean: 1.5 },
  { chips: 3, lean: -1 },
];

/** Columns overlap slightly so the cluster stays inside the hit box. */
const COLUMN_STEP = 0.82;

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  pushed: number;
  press: SharedValue<number>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  chipSize?: number;
};

/** Spends `pushed` chips off the front columns first; every column keeps one chip. */
function spendChips(pushed: number) {
  const counts = COLUMNS.map((column) => column.chips);
  let left = Math.max(0, pushed);

  for (let index = counts.length - 1; index >= 0 && left > 0; index -= 1) {
    const take = Math.min(left, Math.max(0, counts[index] - 1));
    counts[index] -= take;
    left -= take;
  }

  return counts;
}

export function ChipStack({
  stackLabel,
  disabled,
  pushed,
  press,
  dragX,
  dragY,
  chipSize = CHIP_SIZE,
}: ChipStackProps) {
  const held = useDerivedValue(() => withSpring(press.value, { damping: 18, stiffness: 300 }));

  const counts = spendChips(pushed);
  const step = chipSize * COLUMN_STEP;
  const clusterWidth = step * (COLUMNS.length - 1) + chipSize;
  const clusterHeight = Math.max(
    ...counts.map((count) => chipColumnHeight(chipSize, count))
  );

  const baseStyle = useAnimatedStyle(() => ({
    // Planted: the stack settles under the thumb, it does not travel with it.
    transform: [{ translateY: held.value * 2 }, { scaleY: 1 - held.value * 0.035 }],
  }));

  const heldStyle = useAnimatedStyle(() => ({
    opacity: held.value,
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value - held.value * 16 },
      { rotate: `${held.value * -6}deg` },
      { scale: 0.94 + held.value * 0.1 },
    ],
  }));

  return (
    <View style={styles.root}>
      <View style={{ width: clusterWidth, height: clusterHeight }}>
        <Animated.View style={[styles.cluster, baseStyle]}>
          {counts.map((count, index) => (
            <View
              key={index}
              style={[
                styles.columnSlot,
                { left: index * step, zIndex: COLUMNS.length - index },
              ]}>
              <ChipColumn size={chipSize} count={count} rotate={COLUMNS[index].lean} />
            </View>
          ))}
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.heldSlot,
            { bottom: chipColumnHeight(chipSize, counts[0]), zIndex: COLUMNS.length + 1 },
            heldStyle,
          ]}>
          <ChipColumn size={chipSize} count={HELD_CHIPS} grounded={false} />
        </Animated.View>

        <View style={[styles.badge, disabled && styles.badgeDisabled]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {stackLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
  },
  cluster: {
    ...StyleSheet.absoluteFillObject,
  },
  columnSlot: {
    position: 'absolute',
    bottom: 0,
  },
  heldSlot: {
    position: 'absolute',
    left: 0,
  },
  // Above the cluster so the bottom chip keeps contact with the felt, and
  // right-aligned so it clears the chips lifting off the tall back column.
  badge: {
    position: 'absolute',
    top: -26,
    right: 0,
    maxWidth: '58%',
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(17,23,20,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200,155,60,0.55)',
  },
  badgeDisabled: {
    opacity: 0.45,
  },
  badgeText: {
    color: artStyle.colors.cream,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
```

Now delete `Chip.tsx`'s last stack importer by removing its import — and note that
`CHIP_SIZE` stays `44` so the template's
`Math.min(Math.max(cardWidth * CHIP_TO_CARD, 32), Math.max(CHIP_SIZE, 42))` is unchanged.

**Verify on device or simulator:**

- Three cream columns cluster at the hero seat, tallest at the back, bottom chip
  touching the felt with a contact shadow under it. No hovering.
- Press and hold the stack → the base compresses slightly and two chips lift off the
  tall column. Drag → the lifted chips follow the finger; the base stays planted.
- **Single tap → Call.** **Double tap → Check** (or the "can't check" toast).
  **Drag toward the pot → Raise.** **Swipe down off the chips → Fold.** All four still fire.
- After a Raise the cluster is visibly shorter; after a Call it drops by one.
- The `$300` badge sits above the cluster, right-aligned, clear of the lifted chips, and
  does not clip out of the hit box. Check a long label (`$1,250`) still fits.

### 5c — Pick up, throw, land

**Goal:** every chip in flight gets three beats — peel off the stack, arc over with real
gravity, land and settle — with a contact shadow that grows as it falls. The shadow is
what sells the height.

Edit `.../peek-and-pitch/components/ChipToss.tsx`.

**5c.1** Swap the sprite import. Replace `import { Chip, CHIP_ART_ASPECT } from './Chip';`
with:

```ts
import { CHIP_3Q_ASPECT } from '../../../../../theme/chipArt';
import { ChipSprite } from './ChipSprite';
```

**5c.2** Add `lift` to `ChipFlight`:

```ts
  /** How far the chip peels off the stack before the throw, in pixels. */
  lift: number;
```

**5c.3** Replace `hopOffset` and `travelEase` with the phased versions:

```ts
/** Chip has peeled off the stack. */
const LIFT_END = 0.16;
/** Chip has reached the felt. */
const FLIGHT_END = 0.72;

/**
 * Normalised arc height, 0 at both ends and 1 at the apex. The apex sits at 40%
 * so the rise decelerates and the fall accelerates — the shape gravity makes.
 */
function arcHeight(t: number) {
  'worklet';
  if (t <= 0 || t >= 1) {
    return 0;
  }
  const apex = 0.4;
  if (t < apex) {
    const u = t / apex;
    return 1 - (1 - u) * (1 - u);
  }
  const u = (t - apex) / (1 - apex);
  return 1 - u * u;
}

/** Height above the felt in px, negative being higher. */
function verticalOffset(progress: number, arc: number, lift: number) {
  'worklet';
  if (progress <= 0) {
    return 0;
  }

  if (progress < LIFT_END) {
    // Pick-up: the chip peels off the stack and hangs for a beat.
    const t = progress / LIFT_END;
    return -lift * (1 - (1 - t) * (1 - t));
  }

  if (progress < FLIGHT_END) {
    const t = (progress - LIFT_END) / (FLIGHT_END - LIFT_END);
    return -lift * (1 - t) - arc * arcHeight(t);
  }

  // Settle: one small damped bounce on the felt.
  const u = (progress - FLIGHT_END) / (1 - FLIGHT_END);
  return -arc * 0.1 * (1 - u) * Math.abs(Math.sin(u * Math.PI * 2));
}

/** Fraction of the way from the stack to the pot. */
function travelEase(progress: number) {
  'worklet';
  if (progress <= LIFT_END) {
    return 0;
  }
  const t = Math.min(1, (progress - LIFT_END) / (FLIGHT_END - LIFT_END));
  // Ease out so the chip decelerates into the pot.
  return 1 - (1 - t) * (1 - t);
}
```

**5c.4** Rewrite the body of `FlyingChip`. Keep the existing `useEffect` timing
driver as-is, but scale `lift` down under reduced motion alongside `arc`:

```tsx
  const size = flight.size ?? CHIP_SIZE;
  const landScale = flight.landScale ?? 0.82;
  const arc = reducedMotion ? flight.arc * 0.2 : flight.arc;
  const lift = reducedMotion ? flight.lift * 0.2 : flight.lift;

  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;
  const origin = {
    left: flight.from.x - size / 2,
    top: flight.from.y - size * CHIP_3Q_ASPECT * 0.5,
  };

  const chipStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const eased = travelEase(p);

    return {
      opacity: interpolate(p, [0, 0.03, 1], [0, 1, 1]),
      transform: [
        { translateX: dx * eased },
        { translateY: dy * eased + verticalOffset(p, arc, lift) },
        {
          rotate: `${interpolate(p, [0, LIFT_END, FLIGHT_END, 1], [0, flight.spin * 12, flight.spin * 170, flight.restRotate])}deg`,
        },
        { scale: interpolate(p, [0, LIFT_END, FLIGHT_END, 1], [1, 1.1, 0.94, landScale]) },
        // Flattens onto the felt as it lands, so the chip reads as lying down.
        { scaleY: interpolate(p, [FLIGHT_END, 1], [1, 0.62]) },
      ],
    };
  });

  // Stays on the felt and grows as the chip drops — the cue that carries height.
  const shadowStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const height = -verticalOffset(p, arc, lift);
    const closeness = 1 - Math.min(1, height / Math.max(arc, 1));

    return {
      opacity: interpolate(p, [0, 0.05, 1], [0, 0.6, 0.68]) * (0.3 + closeness * 0.7),
      transform: [
        { translateX: dx * travelEase(p) },
        { translateY: dy * travelEase(p) },
        { scale: 0.5 + closeness * 0.55 },
      ],
    };
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shadow,
          {
            left: origin.left,
            top: flight.from.y - size * 0.14,
            width: size,
            height: size * 0.28,
          },
          shadowStyle,
        ]}
      />
      <Animated.View pointerEvents="none" style={[styles.chip, origin, chipStyle]}>
        <ChipSprite size={size} view="threeQuarter" rotate={flight.restRotate * 0.12} />
      </Animated.View>
    </>
  );
```

**5c.5** Add the shadow style:

```ts
  shadow: {
    position: 'absolute',
    zIndex: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(10,14,12,0.5)',
  },
```

**Verify:** raise → four chips peel off the stack, arc over the felt, and land in the
pot. Each chip's shadow starts small and faint and grows tight and dark as it lands.
Call → one chip does the same. The decision still resolves and the next-hand button
still appears.

### 5d — Retime the throw

The old flights waited `420ms` doing nothing before moving; the pick-up beat replaces
that dead air. In `PeekAndPitchTemplate.tsx`, inside `handleChipDecision`'s flight
builder, change three fields and add `lift`:

```ts
          delayMs: 90 + index * 90,
          durationMs: 1150 + index * 60,
          arc: 88 + Math.random() * 42,
          lift: chipSize * 0.75,
```

`handleChipDecision`'s existing `waitMs` computation already derives from
`delayMs + durationMs`, so the resolve timing follows automatically. Leave
`commit.value`, the `withSequence`, and everything else in that callback alone.

**Verify:** the chip leaves the stack promptly after the gesture rather than pausing.
Raise and Call both still resolve to the feedback overlay, and rapid repeat taps do not
double-fire (`pendingChipRef` still guards it).

---

## Task 6 — Retire the old chip token

Edit `my-expo-app/theme/artStyle.ts`. Replace the `chips` block:

```ts
  chips: {
    vibe:
      'Hand-inked cream clay chip — brick-red rim inserts, heavy dark ink outline, ' +
      'red-and-ink spade medallion, aged paper grain.',
    referenceImage: require('../assets/brand/chips/chip-3q.png'),
    sprites: 'Full sprite set and geometry constants live in theme/chipArt.ts.',
  },
```

The old `exception` key is dropped. Nothing reads `artStyle.chips` at runtime — it is
documentation for agents — so this is safe, but re-grep to confirm before deleting:

```bash
rg "artStyle\.chips" my-expo-app
```

---

## Task 7 — Delete the old assets

Only after Tasks 2–6 are green. Confirm nothing references them:

```bash
rg "casino-chip-3d|chip-gold-spade|poker-chip-sm|poker-chip\.png|poker-chip-shadow" my-expo-app
```

That must return **zero** hits before deleting:

- `my-expo-app/assets/brand/artstyle/casino-chip-3d-reference.png`
- `my-expo-app/assets/brand/artstyle/chip-gold-spade-reference.png`
- `my-expo-app/assets/brand/chip-gold-spade.png`
- `my-expo-app/assets/brand/poker-chip-sm.png`
- `my-expo-app/assets/brand/poker-chip.png`
- `my-expo-app/assets/brand/casino-chip-3d.png` — not on the original list, but it is
  the teal chip that Tasks 2 and 5 stop using, so it is orphaned. **Confirm before deleting.**
- `my-expo-app/assets/brand/poker-chip-shadow.png` and `poker-chip-shadow-sm.png` —
  already unreferenced today. Optional cleanup.

Then restart Metro with a cleared cache, because deleted assets stay in the bundler cache:

```bash
cd my-expo-app && npx expo start -c
```

**Verify:** the app boots and Splash, Auth, Level Reveal, Track HUD, Peek and Pitch, and
the feedback overlay all render with no red-box missing-asset error.

---

## Task 8 — Update the design docs

Without this, the next agent reads the old spec and reverts the work.

**`docs/art-style-guide.md`**

- § 8 → *Chips*: replace the "approved tactile exception" paragraph. The canonical chip
  is now the hand-inked cream clay chip: cream/tan body, brick-red rim inserts, heavy
  dark ink outline, red-and-ink spade medallion, paper grain. Keep the existing rules
  that a chip PNG must be transparent with no baked square or ground shadow, and that
  the contact shadow is a separate view. Keep the `time²` gravity rule.
- Delete the teal-and-gold wording and the sentence about illustrated chips in scenes
  needing a different treatment — one chip design now covers HUD, table, and rain.
- § *Do not use* list: remove "(except the approved reusable reward-chip asset and its
  turnaround sheet)", and add the retired teal/gold 3D chip to the list.
- Leave the "Never ship hearts as lives" rule as is.

**`docs/briefs/chip-asset-brief.md`** — replace the frozen teal spec with the four
shipped sprites, their pixel sizes, and the `key-chip-sprite.py` workflow. The old table
lists `chip-cel-*.png` files that were never produced; drop those rows.

**`docs/briefs/chip-asset-log.md`** — replace the rows with the four new files, role, and
"original generated for Sweet Spot".

**`docs/moodboard/README.md:38`** and **`docs/moodboard/chip-3d-style/README.md:3`** —
both point at deleted files. Repoint to `my-expo-app/assets/brand/chips/chip-3q.png`
and note that gameplay composites `chip-edge.png` slices under a `chip-face.png` cap.

---

## Definition of done

- [ ] `npx tsc --noEmit`, `npm run lint`, and `npm run test` all pass.
- [ ] `rg "casino-chip-3d|chip-gold-spade|poker-chip-sm|poker-chip\.png" my-expo-app`
      returns nothing.
- [ ] Splash, Auth, and Level Reveal rain cream chips that tumble and accelerate.
- [ ] Track HUD shows cream lives and dark sockets for spent ones, legible at 22px.
- [ ] Peek and Pitch: **Raise, Call, Fold, and Check all still fire.**
- [ ] Stack bottom sits on the felt with a contact shadow; it never hovers.
- [ ] Holding the stack lifts chips off it; dragging carries them; the base stays planted.
- [ ] Chips in flight cast a shadow that grows as they fall.
- [ ] Correct-answer confetti still shows chip particles.
- [ ] No chip anywhere shows a box, halo, or magenta fringe.
- [ ] Reduce Motion: chips fall and fly without spin or tumble; all four actions work.
- [ ] Design docs updated so the new chip is canonical.

## Not in scope

`my-expo-app/components/poker/ChipStack.tsx` is a fourth chip surface —
`PokerTableOverlay` / `PokerQuestionScene` draw a stack from coloured `View`s with no
asset, still in teal/oxblood. It will not break, but it will look inconsistent with the
new chip. Worth a follow-up ticket; leave it alone in this pass.
