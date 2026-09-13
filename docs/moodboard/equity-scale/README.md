# The Equity Scale reference sheets

These five supplied sheets define the mechanic, composition, and major animation
beats for The Equity Scale. They are reference material only, not Expo runtime
assets.

## Usage

- `scale-tilt-frames-empty.jpg` — balanced, moderate, and maximum beam poses.
- `props-scale-dial-bulbs.jpg` — prop vocabulary for the scale, dial, and lamps.
- `pit-cards-fall-storyboard.jpg` — right-pan mistake sequence.
- `pit-chips-fall-storyboard.jpg` — left-pan mistake sequence.
- `flanking-pits-open-closed.jpg` — closed hatch and revealed pit states.

Use the sheets for silhouette, staging, pivot placement, and timing. Runtime art
is redrawn as independently composited transparent layers in
`my-expo-app/assets/tables/equity-scale/`.

## Do not ship directly

The JPGs have opaque backgrounds, baked labels, panel dividers, and generated
dial text. The colored plastic chips also conflict with Sweet Spot's canonical
cream clay chips. Never import these files with `require()` and never place
essential values inside generated artwork.

The canonical art guide, palette, cards, and chip sprites still win:
`docs/art-style-guide.md`, `theme/artStyle.ts`, and `theme/chipArt.ts`.
