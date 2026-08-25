# Sweet Spot Canonical Moodboard

**Status:** Canonical  
**Parent guide:** [`docs/art-style-guide.md`](../art-style-guide.md)

This is the only approved moodboard list for new Sweet Spot artwork. Files or
mockups not listed here are exploratory and must not be used as style references
without first updating this document.

## Approved References

### 1. Character and title-card direction

![Canonical 1930s Sweet Spot hero](references/sweet-spot-1930s-hero.png)

File: `docs/moodboard/references/sweet-spot-1930s-hero.png`

Use it for:

- pie-cut eye construction;
- white period animation gloves;
- rubber-hose arms;
- bean-shaped faces and simple noses;
- variable hand-inked outlines;
- muted teal, antique gold, cream, and warm black;
- Art Deco casino staging;
- flat cel paint, paper tooth, film grain, and registration imperfection;
- the hero's “chip in one hand, other hand on the title” pose.

Do not copy:

- exact facial proportions for every character;
- the specific layout for every screen;
- text rendered inside generated imagery.

### 2. Falling reward chip

File: `my-expo-app/assets/brand/artstyle/casino-chip-3d-reference.png`

Use it only for:

- reward rain;
- jackpots;
- stage-completion celebrations;
- streak milestones;
- other tactile physics effects.

This is the one approved realistic 3D exception. It does **not** define character,
environment, card, icon, or general prop rendering.

### 3. Brand tokens

File: `my-expo-app/theme/artStyle.ts`

Use it for:

- canonical style name;
- runtime color tokens;
- links to approved app assets;
- motion principles used by components.

The written detail in `docs/art-style-guide.md` takes precedence if code and docs
temporarily drift.

## Era References (Principles, Not Characters)

Reference the production language of early theatrical animation:

- hand-inked black contours;
- pie-cut eyes;
- rubber-hose limbs;
- white animation gloves;
- painted cels over gouache/watercolor backgrounds;
- title-card lettering and Art Deco marquee design;
- limited palettes and visible film texture;
- strong key poses animated on 2s.

These are era conventions. Do not imitate or trace a recognizable copyrighted
character, logo, scene, or silhouette.

## Canonical Character Rules

Every recurring character must have:

1. a simple silhouette readable at phone size;
2. pie-cut eyes;
3. period gloves whenever hands are visible;
4. rubber-hose curves rather than realistic elbow/knee anatomy;
5. one identifiable poker or learning prop;
6. a front, three-quarter, side, and expression sheet before final animation;
7. a clear role in the learning journey.

The current hero archetype is a wholesome poker nerd: clear glasses, sweater
vest, bow tie, curiosity, and warmth. “Clever” must never become “slick casino hustler.”

## Construction Libraries (Anatomy, Not Heroes)

These sheets teach **how to draw** Sweet Spot characters. They do not replace the
canonical hero poster. Do not copy any figure, costume, or face from them into
the app as a mascot.

### 4. Glove-hand construction tutorial

![Glove hand construction tutorial](references/construction-glove-hands-tutorial.png)

File: `docs/moodboard/references/construction-glove-hands-tutorial.png`

Use it for:

- palm-as-circle, then thumb, then three sausage fingers;
- exaggerated thumb base;
- uneven finger spacing;
- four-digit gloves with optional back-of-hand stitch marks;
- handshake, pointing, fist, and object-grip keys.

Do not copy:

- cigars or other props that are not part of Sweet Spot;
- any labeled tutorial lettering into UI.

### 5. Full glove pose library

File: `docs/moodboard/references/hands-pose-library-full.png`

Use it for: 360° glove angles, pointing, peace/OK, fists, reach, and rest poses.

Do not copy: peace/OK as product icons unless a specific interaction needs them.
Keep Sweet Spot gestures tied to cards, chips, teaching, and celebration.

### 6. Cuffed gesture set (UI scale)

File: `docs/moodboard/references/hands-gesture-set-cuffed.png`

Use it for: compact thumbs-up / thumbs-down / point / palm / fist silhouettes
that still read at badge and feedback size.

Do not copy: using these as a generic sticker pack on every screen.

### 7. Navy hose arms + cream gloves

![Navy rubber-hose arms with cream gloves](references/arms-navy-white-gloves.png)

File: `docs/moodboard/references/arms-navy-white-gloves.png`

Source overlap: [this Pinterest pin](https://pin.it/7CGQVhAXg) is the same class
of sheet (isolated cartoon arms in gloves). Keep one copy; do not add duplicates.

Use it for:

- arm as a jointless ink tube;
- cream cuff where glove meets sleeve;
- high-contrast navy limb / cream glove fill.

Do not copy: navy as the only allowed skin/sleeve color. Sweet Spot sleeves follow
the teal/cream/tobacco wardrobe of the hero poster.

### 8. Expression sheet (24 faces)

File: `docs/moodboard/references/faces-expression-sheet-24.png`

Use it for: pie-cut eyes, graphic mouths, readable emotion at small size.

Do not copy: mustaches, “damsel” lash sets, or any face as a new recurring character.

### 9. Modular feature kit (eyes / nose / mouth)

File: `docs/moodboard/references/faces-feature-kit-modular.png`

Use it for: mixing idle / think / miss / celebrate features onto existing heads.

Do not copy: placing floating features on objects as the default UI language.

### 10. Body-proportion construction

File: `docs/moodboard/references/construction-body-proportions.png`

Use it for: large gloves, large shoes, noodle limbs, circle heads, adult vs compact
proportions, and simple masculine / feminine / round / thin silhouettes.

Do not copy: turning Sweet Spot into stickmen, or imitating any recognizable
studio mouse proportions.

### 11. Era street scene (atmosphere only)

File: `docs/moodboard/references/era-street-scene-film-grain.png`

Use it for: newsreel grain, pie-cut eyes in a full-body walk, period street depth,
gloved hands in costume.

Do not copy: the boy, the bear extra, the newsboy outfit, or the specific street.
This is **not** a Sweet Spot character sheet.

### 12. Hose legs and shoes (shaded)

File: `docs/moodboard/references/construction-hose-legs-shoes-shaded.png`

Use it for: jointless black hose legs, oversized cream shoes, ankle cuffs, walk /
run / jump / skid keys, simple cel shade on the shoe.

Do not copy: turning every character into Mickey-style two-tone shoes, or using
pure black legs as the only allowed sock/pant color.

### 13. Hose legs and shoes (line)

File: `docs/moodboard/references/construction-hose-legs-shoes-line.png`

Use it for: the same lower-body grammar in cleaner line art (stand, cross, kick,
high step). Prefer this sheet when generating ink-only keys.

Do not copy: stock watermarks, or tracing a specific pair into a hero sprite.

## The Peek and Pitch (cartoon keys)

These are the canonical **drawn** gestures for Template 1. Prefer them over the
photoreal camera photos when generating or reviewing Level 1 art.

### 14. Glove sliding a card packet

File: `docs/moodboard/references/peek-glove-slide-cards-sepia.png`

Use it for: four-digit cream glove, hose arm, cards as a short stack on wood,
ornate card backs as period pattern language, inky chips on the table.

Do not copy: the sleeping bulldog, the bartender, the shot glass, or a full-sepia
app palette. Sweet Spot stays teal / gold / cream.

### 15. Corner-lift peek (primary Peek key)

File: `docs/moodboard/references/peek-glove-corner-lift-card.png`

Use it for: thumb + finger pinching the near corner, one rank/suit revealed,
the rest of the card still down. This is the long-press Peek pose.

Do not copy: Mickey-proportion gloves as a character, or that exact King of Clubs
engraving.

### 16. First-person Peek at hole cards

File: `docs/moodboard/references/peek-glove-pov-hole-cards.png`

Use it for: look-down table, two hole cards curled toward the player, other
players as white-glove extras only, chip stacks between the player and the board.

Do not copy: yellow gloves (ours are animation cream), “POKER” chip labels, or
photoreal navy felt as the default table.

### 17. Glove reaching chip stacks (Pitch / chip action)

File: `docs/moodboard/references/pitch-glove-reach-chip-stacks.png`

Use it for: hose arm into a cream glove, grab or hover over inked chip stacks,
dealer-tray rows in the background. Use for chip commit / Pitch energy, not Peek.

Do not copy: a chip-only frame as the Peek (Peek must show cards).

## Peek and Pitch camera (photoreal, limited)

These photos are **camera and table blocking only**. They do not change character
art, palette, or chip rendering. Draw the peek from the cartoon keys above.

### 18. Hole-card peek on dark felt

File: `docs/moodboard/references/peek-pov-hole-cards-felt.png`

Use it for: first-person look-down, two hole cards lifted at the near corner,
chips stacked just beyond the cards, shallow focus toward the table.

### 19. Peek plus community board

File: `docs/moodboard/references/peek-pov-board-and-hole-cards.png`

Use it for: how the board sits farther away than the hole cards; keep the player's
cards large in the foreground.

### 20. Warm lamplight peek (VIP mood)

File: `docs/moodboard/references/peek-pov-warm-lamplight-limited.png`

Use it for: low-key amber light, cream card stock, wood grain as a VIP-room clue.

Do not copy from any Peek photo: real hands, watches, modern card faces, whiskey,
or a photoreal felt texture as the app's default look.

## Table layout (limited)

### 21. Betting-zone felt layout

File: `docs/moodboard/references/table-layout-betting-zones-limited.png`

Use it for: symmetric player spots, color-coded zones, payout text that stays
readable on felt, a fanned deck as a centerpiece.

Do not copy: the crimson “casino red” palette, Three Card Prime branding, or
printing dense payoff tables into Sweet Spot UI. Our tables stay teal / cream /
gold and teach poker, they do not host that game.

## Illustrated chips (in-scene)

### 22. Woodcut chip stacks

File: `docs/moodboard/references/chips-illustrated-woodcut-stacks.png`

Use it for: inked stacks with hatched shade and checkered rims — the language for
chips inside cartoons, not the falling 3D reward.

### 23. Chip angles: line vs hatch

File: `docs/moodboard/references/chips-illustrated-angles-line-and-hatch.png`

Use it for: top, tilt, edge, and stack construction. Prefer the **left (clean
line)** for icons; the **right (hatch)** for poster texture.

Do not copy: blue ballpoint sketch as the final fill color.

### 24. 3D chip turnaround (reward exception only)

File: `docs/moodboard/references/chips-3d-turnaround-reward-exception.png`

Use it for: tilt and edge-on angles of the **already approved** tactile 3D
reward chip.

Do not copy: red/blue/green plastic casino colors, or using this grid for
character-scene chips.

## Canonical World Translation

| Product world  | Moodboard interpretation                                         |
| -------------- | ---------------------------------------------------------------- |
| Benny's Garden | Painted 1930s backyard club, afternoon cream/green, string bulbs |
| Local Casino   | Art Deco hall, marquee bulbs, brass rails, mechanical slots      |
| VIP Room       | Inky club interior, velvet, marble patterns, spotlight           |
| Final Table    | Newsreel stadium, radial beams, crowd silhouettes                |

Modern product terms such as “neon” describe emphasis and energy, not cyberpunk art.

## Explicitly Rejected / Non-Canonical

Do not use these as visual references:

- modern Disney/Pixar-like 3D people;
- Duolingo-style modern flat mascots;
- anime or kawaii character sheets;
- photoreal casino interiors (Peek photos are camera-only; they are not world art);
- modern luxury poker lifestyle (watches, Slowplay-style chips, photoreal navy felt);
- hustler nightlife props (tattoos, cigarettes, whiskey as character identity);
- real-casino branded chips (Borgata and similar);
- glossy vector clip-art chip stacks;
- cyberpunk teal/purple neon;
- older inconsistent hand sheets that used five fingers, thin wrists, or modern
  vector mascot gloves (replaced by the construction libraries above);
- previous Professor Fold and Chippy renderings;
- previous “Example 1 / 2 / 3” logo character renderings;
- old splash alternatives and composite experiments;
- any image with inconsistent finger anatomy, visible generation artifacts, or a
  white/black rectangle around a supposedly transparent asset.

Rejected files may remain in git history for traceability, but they do not define
the product.

## Adding a New Reference

Before adding anything:

1. Compare it against every non-negotiable in `docs/art-style-guide.md`.
2. Confirm it introduces a needed visual answer, not just another option.
3. Store it under `docs/moodboard/references/` with a descriptive filename.
4. Add it to the approved list above with a specific “Use it for” scope.
5. State what must **not** be copied from it.

If a reference is removed from this list, it immediately becomes non-canonical.

## Still worth adding later

Send these next if you have them — they close real gaps the current pack does not:

1. **Sweet Spot hero expression sheet** — our nerd + companion in idle / think /
   correct / miss / celebrate.
2. **Illustrated playing cards** (cream stock, heavy suits, period faces) as a
   full deck sheet, not one King.
3. **Benny's Garden / Local Casino gouache backgrounds** with empty UI space.
4. **Title-card lettering samples** that match the hero poster.
5. **Squash-stretch timing keys** for celebration and miss.
6. **Glove swipe-up fold / pull-down call** keys — we have Peek and chip-reach,
   not the Pitch swipe itself.

Do not send more photoreal poker POV, generic glove grids, or extra chip-grab
frames unless they show a new gesture (fold swipe, call pull, badge point).
