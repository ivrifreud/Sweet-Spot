# Sweet Spot Art Style Guide

**Status:** Canonical  
**Visual era:** Early 1930s theatrical animation  
**Applies to:** Characters, environments, illustrations, icons, feedback, transitions, marketing art, and generated assets  
**Canonical moodboard:** [`docs/moodboard/README.md`](moodboard/README.md)

This document is the visual source of truth for Sweet Spot. When an older mockup,
prototype, branch, prompt, or asset conflicts with this guide, this guide wins.
Product behavior and world structure still come from the MVP specification; this
guide defines how those systems look and move.

## 1. The Core Idea

Sweet Spot should feel like a lost 1930s casino cartoon restored for a modern
mobile game: warm, mischievous, tactile, slightly imperfect, and full of life.

The art is **hand-inked rubber-hose animation**, not a modern character illustration
with a vintage filter placed on top.

Every asset should pass this sentence:

> It looks as if an animation studio in 1933 drew a playful poker lesson, then we
> carefully restored the film for a phone screen.

### Three non-negotiable traits

1. **Handmade ink:** variable black outlines, small wobbles, and rounded construction.
2. **Period character language:** pie eyes, white gloves, rubber-hose limbs, expressive mouths.
3. **Aged cel finish:** muted color, paper tooth, restrained film grain, and subtle registration drift.

## 2. What This Style Is Not

Do not use:

- modern Disney/Pixar-style 3D rendering;
- glossy mobile-game character art;
- anime eyes or modern kawaii proportions;
- photoreal people or environments;
- cyberpunk casino neon;
- clean corporate vector characters;
- airbrushed gradients on faces or clothing;
- perfect, sterile outlines;
- direct copies of recognizable copyrighted cartoon characters.

We use the visual grammar and production limitations of the era, not another
studio's characters, silhouettes, or trademarks.

## 3. Character Construction

### Heads and faces

- Build heads from beans, circles, pears, and soft wedges.
- Use **pie-cut eyes**: black oval pupils with a cream wedge highlight.
- Keep eyes close enough to read as one expressive unit.
- Noses are small cream/skin-tone beans or rounded wedges defined by warm ink.
  Avoid large solid-black button noses on human characters.
- Mouths use large readable crescents; teeth and tongues are simple graphic shapes.
- Eyebrows float and bend for clarity.
- Avoid realistic anatomy, detailed eyelashes, pores, or facial rendering.

### Bodies and limbs

- Arms and legs follow long C- and S-curves: the classic rubber-hose principle.
- Limbs should read **thick and confident**, not thin spaghetti lines.
- Joints bend smoothly; do not draw anatomical elbows or knees unless needed by a pose.
- Hands use **thick period animation gloves** with three fingers plus thumb.
- Gloves have chunky padded palms, full rounded fingers, sturdy cuffs, and one or
  two simple palm marks. Avoid delicate wrists or thin, tapered hands.
- Shoes are oversized, rounded, and easy to read in silhouette.
- Torsos use simple pear, bean, or barrel shapes.

The glove convention is intentional. It replaces realistic finger counting with a
consistent animation language across the whole product.

### Character archetypes

The core human archetype is the **wholesome poker nerd**:

- clear prescription glasses;
- sweater vest, bow tie, rolled sleeves, or period-inspired club clothing;
- curious posture and visible delight when learning;
- clever rather than smug;
- energetic rather than slick or predatory.

The companion should feel like a supportive classmate or eccentric tutor, never a
casino hustler.

### Expressions

Expressions must remain readable at phone size:

- **Idle:** open posture, soft pie eyes, small rhythmic bounce.
- **Thinking:** eyes angle upward, mouth compresses, head tilts, one glove taps.
- **Correct:** broad crescent smile, eyes arc, body stretches upward.
- **Mistake:** brief squash and surprise, then a warm recovery—not shame.
- **Celebration:** elastic arms, heel kick, chip flourish, two-beat overshoot.

## 4. Ink and Line

### Line behavior

- Primary silhouette: heavy black or near-black ink.
- Interior detail: approximately 55–70% of silhouette weight.
- Allow tiny width changes and slight contour wobble.
- Round all line caps and joins.
- Avoid vector-perfect symmetry.
- Keep details sparse enough to survive at 44–80 px.

### Ink color

Use `#171713` or a warm near-black. Pure digital black is acceptable only for
small high-contrast details such as pupils.

### Registration

For large illustrations only, color may drift 1–2 px from the ink in selected
areas. This should feel like cel registration, not a glitch effect.

## 5. Canonical Palette

The palette is muted and warm. Bright colors are reserved for functional feedback.

| Role       | Name            |       Hex | Use                                   |
| ---------- | --------------- | --------: | ------------------------------------- |
| Background | Projector Black | `#111714` | Deepest night and inked voids         |
| Primary    | Casino Teal     | `#0B5F5D` | Tables, vests, panels, world identity |
| Secondary  | Faded Teal      | `#4F8580` | Midtones and secondary surfaces       |
| Brand      | Antique Gold    | `#C89B3C` | Logo, rewards, major highlights       |
| Highlight  | Lamp Gold       | `#E6C46A` | Bulbs, glints, success accents        |
| Paper      | Animation Cream | `#E8D7A7` | Gloves, eyes, cards, light text       |
| Neutral    | Tobacco Brown   | `#765337` | Wood, outlines in warm scenes         |
| Error      | Oxblood Red     | `#A43E32` | Mistakes and warnings                 |
| Success    | Felt Green      | `#4D8A5B` | Correct decisions and progression     |

### Functional color rules

- Correct answers use Felt Green plus Antique Gold.
- Mistakes use Oxblood Red, never fluorescent red.
- Lamp Gold marks rewards, jackpots, and the strongest CTA.
- Electric cyan and cyberpunk purple are not part of the core palette.
- A brighter modern color may appear for accessibility, but it must be framed by
  the vintage palette and used only as a functional signal.

## 6. Light, Shading, and Texture

### Character shading

- Prefer flat cel fills.
- Add one hard-edged shadow shape at most.
- Use a small cream highlight only when it improves readability.
- Never use glossy skin, subsurface scattering, or volumetric 3D light.

### Environment shading

- Use gouache/watercolor washes, dry-brush texture, and simplified Art Deco light.
- Shadows may be soft in backgrounds, but foreground props remain graphic.
- Light sources are marquee bulbs, table lamps, moonlight, windows, and spotlights.

### Film treatment

At final composite size:

- monochrome grain: 3–6% opacity;
- sparse dust: 1–3% opacity;
- vignette: subtle, never crushing UI contrast;
- optional single-frame scratches during transitions only;
- restrained flicker: maximum ±2% brightness.

Film texture must never obstruct text, cards, chip counts, or answer states.

## 7. Environments and the Four Worlds

The product world's purpose stays unchanged; its visual interpretation follows this guide.

### World 1 — Benny's Garden

- 1930s backyard learning club;
- painted fence, garden table, string bulbs, radio, lemonade, birds;
- afternoon cream/green treatment; moonlit teal at night;
- welcoming and homemade.

### World 2 — Local Casino

- period casino hall with Art Deco signage and incandescent marquee bulbs;
- mechanical slots, painted cards, brass rails, cigarette-card typography;
- “neon” in product copy means bright period signage—not cyberpunk lighting.

### World 3 — VIP Room

- inked Art Deco club, velvet, marble patterns, brass lamps, city windows;
- fewer props, stronger spotlight, more negative space;
- premium without photoreal luxury rendering.

### World 4 — Final Table (deferred)

- theatrical stage, radial light beams, crowd silhouettes, newsreel energy;
- dramatic but still graphic and period-correct.

## 8. Props and Poker Objects

Cards, chips, dice, and table objects should be readable immediately.

### Playing cards

- cream stock instead of pure white;
- heavy suit marks;
- imperfect ink registration;
- large corner indices;
- period face-card engraving.

### Chips

The current falling chip is an approved **tactile exception**:

- a realistic thick 3D teal-and-gold chip may be used for reward rain and physics;
- it must have a transparent background and no baked square or ground shadow;
- its teal/gold materials must match the canonical palette;
- illustrated chips inside character scenes should still use ink-and-cel treatment.

This exception keeps the reward object satisfying without changing character or
environment art direction.

## 9. Typography

### Display

- Use bold hand-lettered title cards, slab serifs, or period casino signage.
- Letters may have a cream/gold face, dark teal inline, and one simple offset shadow.
- Slightly imperfect baselines and widths are welcome.

### UI

- UI text must remain highly readable.
- Use a condensed display face only for short labels and CTAs.
- Use a neutral humanist sans for paragraphs, settings, and instructions.
- Do not force decorative lettering into small body copy.

### Copy treatment

- Sentence case for instructions.
- Uppercase is appropriate for title-card CTAs such as `PRESS TO PLAY`.
- Avoid multiple outlines, gradients, glows, and bevels on the same UI label.

## 10. Motion Language

Motion should combine classic cartoon timing with readable game physics.

### Character animation

- Animate primarily on 2s (12 drawings per second feel).
- Use held poses and strong keys rather than constant smooth motion.
- Favor anticipation → action → overshoot → settle.
- Squash and stretch should preserve perceived volume.
- Use arcs for hands, heads, chips, and reaction motions.

### UI animation

- Buttons compress quickly (80–120 ms), overshoot once, then settle.
- Correct feedback may stretch upward and ring once.
- Mistake feedback uses one short horizontal shake, then returns to calm.
- Navigation can use iris wipes, card wipes, projector flicker, or ink reveals.

### Physics effects

Reusable object effects may use real acceleration when physical credibility matters.
The falling-chip mechanic uses distance proportional to `time²`, so chips start
slowly and accelerate under gravity. It is intentionally reusable for rewards,
stage completion, streak milestones, and jackpots.

## 11. UI and Illustration Relationship

- Illustration creates atmosphere; UI communicates state.
- Keep interactive elements above texture and grain.
- Reserve clear negative space around CTAs and cards.
- Do not place essential information inside generated artwork.
- Every interaction needs a non-color cue: movement, shape, icon, or sound.
- Minimum touch target: 44 × 44 pt.

## 12. Asset Production Checklist

Before approving any new asset:

- [ ] Does it use genuine 1930s construction rather than a vintage filter?
- [ ] Are character eyes pie-cut and limbs rubber-hose?
- [ ] Are hands consistent period gloves?
- [ ] Are outlines variable, warm, and slightly imperfect?
- [ ] Is the palette muted teal/gold/cream with controlled red/green?
- [ ] Is shading flat and graphic rather than modern 3D?
- [ ] Is film texture restrained and separate from UI?
- [ ] Does it remain readable at target phone size?
- [ ] Does it avoid copying a recognizable existing cartoon character?
- [ ] Is the transparent edge clean, with no white/black rectangle?

## 13. Prompt Starter for Generated Art

Use this as a starting block, then add the scene-specific action:

> Authentic early-1930s rubber-hose theatrical cartoon, hand-inked variable black
> outlines, pie-cut eyes, white period animation gloves, curved rubber-hose limbs,
> bean-shaped heads, flat cel paint, muted casino teal, antique gold, animation
> cream and oxblood accents, gouache Art Deco background, subtle paper tooth,
> restrained film grain and registration drift. Wholesome poker-learning tone.
> No modern 3D animation, no Pixar/Disney gloss, no anime, no cyberpunk neon,
> no photorealism, no smartphone.

Always specify the exact pose, prop, empty space, aspect ratio, and whether text
must be omitted. Generated text should not be trusted for final UI.

## 14. Canonical and Non-Canonical Sources

Canonical:

1. this guide;
2. `docs/moodboard/README.md`;
3. approved references listed by that README;
4. `my-expo-app/theme/artStyle.ts` for code tokens.

Non-canonical:

- rejected mascot concepts;
- previous modern 3D/Pixar-like character art;
- cyberpunk casino backgrounds;
- experiments labeled “old cartoon” that lack pie eyes, gloves, and ink construction;
- photoreal chip reference images (except the approved reusable reward-chip asset);
- generated alternatives not listed in the canonical moodboard.
