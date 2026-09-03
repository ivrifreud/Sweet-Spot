# Chip 3D-style look targets

These sheets are **look targets**, not runtime bitmaps. Gameplay composites
`chip-edge.png` slices under a `chip-face.png` cap, plus a contact shadow drawn
in the UI. The three-quarter air chip is `chip-3q.png`.

Place the two Gemini attachments here as:

- `physics-arrangements.jpg` — four panels on felt: tall stack, clustered stacks, messy pot heap, clash/bounce leftovers
- `pose-sheet.jpg` — 3/4 rest, top-down, side/edge, falling with trail, reverse + 3-chip stack

| Panel | Automation |
| --- | --- |
| Tall aligned column | `small` / `medium` / `large` / `allIn` stack tiers |
| Clustered stacks + leaning chips | raise leftover chips, multi-column hero stack |
| Messy pot heap | `throwToPot` rest pose |
| Loose chips around stacks | `clashAndBounce` |
| Top-down / 3/4 / edge | `ChipVisual` rest, tilt, and side-profile blend |
| Falling with trail | splash `GravityFallingChips` |
