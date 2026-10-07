---
name: sweet-spot-screen-style
description: Applies the Sweet Spot 1930s rubber-hose visual direction to Expo/React Native UI — artStyle color tokens, Chewy and Boogaloo design type, cartoon motion timing, and repo screen conventions. Use when building, restyling, or reviewing any screen or component under my-expo-app.
---

# Sweet Spot screen style

Sweet Spot looks like a lost 1930s casino cartoon restored for a phone: warm,
mischievous, tactile, slightly imperfect. Illustration carries atmosphere; UI
carries state.

This file is the code-level subset. Full visual detail, character construction,
and world descriptions live in [docs/art-style-guide.md](../../../docs/art-style-guide.md).

## Color

Import tokens; do not hardcode hex in new code.

```tsx
import { artStyle } from '../theme/artStyle';
```

| Token          | Hex       | Use                                    |
| -------------- | --------- | -------------------------------------- |
| `projectorBlack` | `#111714` | Screen background, inked voids       |
| `teal`           | `#0B5F5D` | Tables, panels, world identity       |
| `tealFaded`      | `#4F8580` | Midtones, secondary surfaces         |
| `gold`           | `#C89B3C` | Logo, rewards, major highlights      |
| `goldBright`     | `#E6C46A` | Bulbs, glints, strongest CTA         |
| `cream`          | `#E8D7A7` | Body text, cards, gloves             |
| `tobacco`        | `#765337` | Wood, warm-scene outlines            |
| `oxblood`        | `#A43E32` | Mistakes and warnings                |
| `feltGreen`      | `#4D8A5B` | Correct decisions, progression       |

Functional rules:

- Correct uses Felt Green with Antique Gold. Mistakes use Oxblood, never a
  fluorescent red.
- Lamp Gold (`goldBright`) marks rewards and the single strongest CTA on screen.
- Muted text is `cream` at reduced alpha, e.g. `rgba(232,215,167,0.82)`.
- No electric cyan or cyberpunk purple. A brighter accessibility color must stay
  framed by this palette and carry a functional meaning.

## Typography

Chewy and Boogaloo are the design fonts. Load them from `theme/displayFont.ts`.

```tsx
import { useBoogalooFont, useDisplayFont } from '../theme/displayFont';

const display = useDisplayFont();
const reading = useBoogalooFont();
// <Text style={[styles.title, display]}>
// <Text style={[styles.explanation, reading]}>
```

- Chewy (`useDisplayFont`) is for short labels, titles, and CTAs. Tracking stays
  tight, about 0.3–0.6, with enough line height that the letters are not clipped.
- Boogaloo (`useBoogalooFont`) is for explanation cards, tutorial instructions,
  and settings-menu writing.
- Both faces are a single weight. Keep `fontWeight` at 400.
- Other paragraphs stay the default humanist sans.
- Gold or cream face, at most one offset shadow. Never stack outline, glow,
  gradient, and bevel on one label.
- Sentence case for instructions. Uppercase only for title-card CTAs such as
  `PRESS TO PLAY`.

## Motion

Reanimated is the animation layer. Follow anticipation, action, overshoot,
settle — held poses beat constant smooth motion.

- Button press: compress in 80–120 ms, one overshoot, then settle.
- Correct feedback stretches upward and rings once. A mistake is one short
  horizontal shake, then calm.
- Reward beats reuse `GravityFallingChips` from `components/effects`, whose fall
  distance is proportional to time squared.
- Screen transitions may use iris wipes, card wipes, projector flicker, or ink
  reveals.

## Screen structure

Production screens use `StyleSheet.create` with theme tokens. NativeWind is
configured but only used by unused scaffold components; do not introduce
`className` styling into app screens.

Backdrop pattern, as in `screens/AuthScreen.tsx`:

```tsx
<ImageBackground source={require('../assets/brand/splash-opener-approved.jpg')} resizeMode="cover">
  <LinearGradient
    colors={['rgba(17,23,20,0.42)', 'rgba(17,23,20,0.82)', 'rgba(17,23,20,0.95)']}
    locations={[0, 0.28, 1]}
    style={StyleSheet.absoluteFill}
  />
</ImageBackground>
```

- Safe area via `useSafeAreaInsets()` padding, or `SafeAreaView` for simple
  status screens.
- Keep interactive elements above texture and effect layers using `zIndex`, and
  give effect layers `pointerEvents="none"`.
- Reserve clear negative space around CTAs and cards.
- Minimum touch target 44 x 44. Every state needs a non-color cue as well:
  movement, shape, icon, or sound.
- Set `accessibilityRole` and a label on every control; announce live results
  with `accessibilityLiveRegion="polite"`.

## Do not

- No modern 3D, Pixar gloss, anime eyes, or photorealism.
- No cyberpunk neon. "Neon" in product copy means period signage bulbs.
- No film grain, dust, or vignette over text, cards, or chip counts.
- No essential information baked into generated artwork.

## Checklist

- [ ] Colors come from `artStyle.colors`, not literals
- [ ] Exactly one strongest gold CTA
- [ ] Display face on short labels only; sans for body
- [ ] Press feedback compresses and overshoots once
- [ ] Interactive layer sits above effects, targets at least 44 x 44
- [ ] Every state readable without relying on color alone
