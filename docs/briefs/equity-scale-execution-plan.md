# The Equity Scale execution brief

Status: Sprint 2 vertical slice  
Template: 2 — The Equity Scale  
Pillar: II — Mathematical Framework

This brief resolves the supplied handoff against `docs/mvp.md`,
`docs/Question_Templates.md`, and `docs/art-style-guide.md`.

## Slice

Level 1 Stage 1 contains five authored demo draw spots rendered with The Equity
Scale. Calibration remains on The Peek and Pitch. Call/Fold is the scored answer;
the selected outs are recorded and explained but never change correctness.

## Interaction

1. Cards and chip pot enter on opposite pans.
2. The player rotates the Outs Dial from 0–20. The control moves continuously
   without haptic stops; the displayed outs value is an integer.
3. The beam tips from the player's estimate versus the price, with no green/red
   correctness signal.
4. Releasing the dial ends adjustment but does not submit.
5. The player presses Call or Fold to lock in.
6. The server grades only the decision, then the template plays its in-world
   outcome before shared feedback appears.

State order:
`entering → dialing → deciding → submitting → correct|incorrect → resolved`.

## Math contract

- `potBeforeCall` includes the villain's wager already in the middle.
- `requiredEquity = priceToCall / (potBeforeCall + priceToCall)`.
- On the turn, `hitChance = outs / 46`.
- On the flop, `hitChance = 1 - ((47 - outs) / 47) × ((46 - outs) / 46)`.
- `callEv = hitChance × potBeforeCall - (1 - hitChance) × priceToCall`.
- The beam angle uses selected-outs equity minus required equity, clamped to the
  configured maximum. It must never read `correctOuts`.

Authored content stores explicit numbers; UI code must not parse bet amounts from
prose. Seed validation must prove that every `correctDecision` matches the same
formula using `correctOuts`.

## Motion

Correct: cards land, the Felt Green/Lamp Gold signal turns on, the scale settles
balanced, then performs one mild two-beat bounce.

Incorrect: cards land, the Oxblood signal flashes, the hardware shakes once,
hatches open, pans tilt outward and detach, and cards/chips fall into separate
pits with distance proportional to `time²`.

Animation uses held keys and one overshoot. Reduced motion replaces travel,
shake, and bounce with short crossfades and a persistent outcome icon.

## Visual and accessibility rules

- World art remains the backdrop; Projector Black is used for pits and underlay.
- Generated reference labels never enter runtime art.
- Runtime scale parts are separate transparent images. Cards and canonical cream
  chips reuse existing app art.
- All values and controls sit above texture. Call, Fold, and dial controls expose
  at least 44×44 pt targets.
- The dial supports adjustable accessibility increment/decrement actions.
- Outcome is conveyed by text/icon/motion as well as color and announced through
  a polite live region.

## Data

Each Equity Scale spot supplies: ID, template and pillar, hole cards, board,
street, position, action line, `potBeforeCall`, `priceToCall`, `correctOuts`,
Call/Fold answer, takeaway, progress label, skin, Elo, and severity.

`spot_attempts.answer_metadata.selectedOuts` is informational. Existing
server-authoritative duplicate protection, Chip burn/lockout, Elo update, and RLS
remain unchanged.

## Acceptance

- Five Level 1 Stage 1 demo spots run end to end.
- Dialing never reveals correctness and never submits.
- A final decision submits once; selected outs cannot change its grade.
- In-world outcome finishes before the shared feedback overlay.
- Wrong decisions burn one Chip and update Elo.
- Pans, pits, values, safe areas, and HUD remain legible on phone layouts.
- Reduced-motion and adjustable-control paths preserve all information.
- Existing calibration and Peek and Pitch tests remain green.
