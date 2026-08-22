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
- photoreal casino interiors;
- cyberpunk teal/purple neon;
- the hand reference that previously drove the moodboard;
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
