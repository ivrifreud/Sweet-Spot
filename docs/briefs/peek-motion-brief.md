# Peek motion brief (frozen)

Implementers must not invent extra motion. Use these poses only.

## Packet
- Exactly two hole cards, overlapping as one packet.
- Far/dealer edge stays on the felt.
- Near/top corners lift together; the right-hand pinch corner leads.
- Rank and suit become readable at the pinched corners. Do not show a third card, HUD box, or full faces.

## Poses
| Pose | Duration | Transform |
| --- | --- | --- |
| rest | held | Flat on felt. Rise 0. RotateX 0 relative to felt plane. |
| corner pinch | 90–120 ms after hold starts | Glove contacts near-right corner. Cards still almost flat (rise ≤ 6% of card height). |
| lift | 180–240 ms, then hold | Packet C-curve. Max corner rise 18% of card height. Max extra rotateX 16°. Volume preserved (no squash that looks like a broken plate). |
| settle | 180–240 ms | One small overshoot (≤ 8%), then rest. |

## Timing language
- Animate as held cartoon poses on 2s, not a continuous 60 fps float.
- Peek does not start on touch-down. Cancel before pinch if the finger is on the chip stack or commits a fold swipe.
- Call/Raise `commit` must not move hole cards.

## Hands
- Hero glove: rest → pinch → held lift → settle. Stepped crossfade, not a morph.
- Barrier glove: one shield pose while peeking. Do not mirror every peek delta.

## Reduced motion
- No 3D bend, no overshoot.
- Reveal PeekIndex plates with 120 ms opacity.
- Same information and the same gesture outcomes.

## Forbidden
- Boxed PeekHud overlay.
- 8 independent peel slices that read as a hard box or broken card.
- Instant peek spring to 1 on touch begin.
- Continuous floating while held.
