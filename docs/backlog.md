# Backlog

Someday list for Sweet Spot. This is not the sprint plan. `docs/mvp.md` and `docs/sprint-current.md` still decide what gets built now. An item here gets built only when you ask for that item.

Pain and Time are estimates. Edit them in the card when they are wrong. A line `- Pin: yes` keeps that item where you put it.

Order for **Do next**: high pain and a short time, then high pain and a longer time, then medium, then low. A pin beats that order. The list refreshes when an item is added or closed, or when you ask what is next.

## How to talk to it

Say it in a normal sentence. The file is the source of truth. A hand edit wins the next time this file is read.

- **Add.** “Add to the backlog: the plus next to the gold bar looks off center.” One sentence is enough. The next free id, area, pain, time, and a fix note get filled in. **Do next** is refreshed.
- **Fixed.** “Fixed: B-08” or the title. The card leaves Open and Do next. Done gets one line: date, id, title. The newest twenty stay.
- **Drop.** “Drop: B-12” when you no longer want it. It disappears, with no Done line.
- **Reorder.** “Put the streak flame above the gold plus,” or add `- Pin: yes` on the card.
- **Next.** “What’s next on the backlog?” reads **Do next** and does not start a fix.

Areas: Bug, Look, Motion, Sound, Feature, Copy. One primary area per card.

Time values: `30m`, `2h`, `half day`, `1–2 days`.

## Do next

1. **B-16** — The Hot Seats orbit freezes before it starts. High. 2h.
2. **B-17** — The Hot Seats card outlines are uneven. High. 2h.
3. **B-11** — The glove hovers instead of grabbing the chips. High. half day.
4. **B-12** — The hero chip stack looks copied, not stacked. High. half day.
5. **B-09** — Call and raise chips look flat in the air. High. half day.

## Open

### Bug

No open items.

### Look

### B-17 — The Hot Seats card outlines are uneven

- Area: Look
- Where: The Hot Seats
- Pain: High
- Time: 2h
- Fix: `HeroCardStack` previously combined an artificial shell with the painting's irregular card window. Render enlarged card faces above the table plate and below the thumb with no added black shell. Keep the left and right rectangles independently adjustable so the right card can grow and the left card can lean farther without exposing the painted silhouette.

### B-12 — The hero chip stack looks copied, not stacked

- Area: Look
- Where: The Peek and Pitch
- Pain: High
- Time: half day
- Fix: The hero stack in `ChipStack` / `ChipPile` repeats the same chip face, so it reads as copies on one plane. Stack each chip by the real edge height (`CHIP_EDGE_RATIO`) with a contact shadow, using the edge-under-face composite from `docs/moodboard/chip-3d-style`. The column should get shorter as chips leave, and the top chip should be the one B-11 grabs.

### B-09 — Call and raise chips look flat in the air

- Area: Look
- Where: The Peek and Pitch
- Pain: High
- Time: half day
- Fix: `ChipToss` flies chips from the stack to the pot, and some of those sprites are a flat face. Use the three-quarter chip with an edge (`chip-3q` plus the edge slice) for the whole flight, including the lift off the stack and the settle. Thickness should stay visible while the chip spins. Same art as B-10 and B-12.

### B-03 — Map tiles change color when the fog lifts

- Area: Look
- Where: World Map
- Pain: High
- Time: half day
- Fix: Some tile images do not share an edge color, so the seam shows when the fog parts in `WorldMap`. Match the tile edges to one fog-side palette, and make the chunk fallback color in `WorldMapArtLayer` the same as that edge. A world transition should not flash a different ground color.

### B-02 — The map path is not on the painted road

- Area: Look
- Where: World Map
- Pain: High
- Time: 1–2 days
- Fix: `LevelProgressionMap` draws the trail as its own line, separate from the road already painted in the tile. Author the path on that road centerline (`mapPath`, and each world geometry such as the garden and local-casino maps) and draw the trail above the tile art, under the nodes. The dotted path and the player walk should stay on the same road.

### B-04 — Map nodes should sit on the ground

- Area: Look
- Where: World Map
- Pain: High
- Time: 1–2 days
- Fix: Checkpoints in `MapCheckpoint` / `MapNodeMedallion` read as flat badges on top of the map. Sit each node on a plate with a contact shadow so it feels 2.5D and on the road, using the map-node look target in `docs/moodboard/chip-3d-style`. Feet from B-05 should land on that plate, not beside it.

### B-08 — The gold plus sits off center

- Area: Look
- Where: gold bar
- Pain: Medium
- Time: 30m
- Fix: The plus in `MarqueeRail` is a text glyph sized with `lineHeight` and a negative margin, so it sits off the gold icon. Center it in the round button with flex alignment, and keep the tap target on the button. It should look seated on the gold cluster at the compact and regular sizes.

### B-10 — Some splash chips look flat

- Area: Look
- Where: Splash
- Pain: Medium
- Time: 2h
- Fix: `GravityFallingChips` rains chips on the splash, and some of them are a flat face. Draw every falling chip as the three-quarter chip with an edge, same as B-09, so the rain has thickness. Keep the existing fall arc.

### B-07 — The streak flame stays the same after two days

- Area: Look
- Where: streak
- Pain: Medium
- Time: 2h
- Fix: `StreakFlameIcon` is one static flame, and `TrackHud` shows it for every streak length. From 3 days on, switch to a hotter flame (brighter core, a small flicker) so an ongoing streak looks like it is burning. Days 0–2 keep the current icon.

### Motion

### B-16 — The Hot Seats orbit freezes before it starts

- Area: Motion
- Where: The Hot Seats
- Pain: High
- Time: 2h
- Fix: `HotSeatSwapVideo` used to reveal a stale frame while a new seek resolved, then the first fresh-frame guard used a 500ms timeout that was too short for the phone and always fell back. Pre-roll the muted hidden player from 1.5s to 1.55s, park it back at the cue, and start a decision only from that warmed state. Reveal only after source time advances again; allow a 1000ms safety gate before using the existing fade.

### B-11 — The glove hovers instead of grabbing the chips

- Area: Motion
- Where: The Peek and Pitch
- Pain: High
- Time: half day
- Fix: On call and raise, `BarrierHand` reaches toward `stackAnchor` with a fixed offset and the rest glove, so the fingers sit above the stack and never close on a chip. Plant the contact point on the top chip, close the hand on it, and release along the `ChipToss` arc toward the middle. The hand should leave only after the chip is in the air.

### B-01 — The hand that turns the Equity Scale dial

- Area: Motion
- Where: Equity Scale
- Pain: Medium
- Time: half day
- Fix: The outs dial is turned by the phone glove in `EstimateDial` and `dialGloveLayout`. Before rebuilding it, name what feels wrong: the hand art, the pivot, or how the dial follows the finger. The change to aim for is a thumb that stays planted on the dial through the turn, with the dial rotating under that contact.

### Sound

No open items.

### Feature

### B-13 — A family pot on The Peek and Pitch

- Area: Feature
- Where: The Peek and Pitch
- Pain: Medium
- Time: 1–2 days
- Fix: Chips already fly toward `potCenter`, and the spot has a `potLabel`, but the table has no pot you can see grow. Add a heap in the middle that catches the toss and stacks the landed chips. Build it from the same stacked chip as B-12. The messy-heap target is in `docs/moodboard/chip-3d-style`.

### B-14 — A dealer hand deals the hole cards

- Area: Feature
- Where: The Peek and Pitch
- Pain: Medium
- Time: 1–2 days
- Fix: The template already has a `dealing` phase. The glove on screen is the player’s hand (`HeroHand`), not a dealer. Add a dealer glove at the far edge of the felt that slides the hole cards in, into the hand the player then peeks. The player’s glove should receive the cards, not deal them.

### Copy

No open items.

## Done

- 2026-10-04 — B-05 — The player leaves the node and stays on the map
- 2026-10-02 — B-15 — Every result should explain the right move
- 2026-09-30 — B-06 — Feedback text is cut off
