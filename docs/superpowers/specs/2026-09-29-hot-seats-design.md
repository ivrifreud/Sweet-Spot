# The Hot Seats

Template 7. Pillar I. One four-seat, one-street story on a phone.

The Peek and Pitch stays the headline Pillar I template. The Hot Seats adds a second surface for position and prior action. Raise size is scripted, so this is not Pillar IV and not a replacement for the Sniper Slider. It is not the Arena.

## Runtime

Phases: `arriving` → `card` → `deciding` → `swapping` (correct, and a seat remains) or `explaining` (wrong, or the fourth seat). After the camera lands, the next seat is `arriving` and the arrival card opens immediately.

The engine is pure: `begin`, `cameraReady`, `cardCleared`, `decide`, `cameraLanded`. An illegal action or a decision in the wrong phase returns the same state. Buttons are unlocked only in `deciding`. `decide` takes the action and, for a raise, the chosen size.

The active seat is always bottom center. The next actor is screen left, the following actor is far, and the previous actor is screen right. A correct decision whooshes clockwise: 80ms anticipation, 440ms travel, 200ms settle (720ms total), with a crossfade at 360ms. Reduced motion is a 180ms fade and does not swing the camera. The first seat settles for 200ms and does not whoosh.

## Arrival and decisions

The parchment card sits on the open felt, above the hole cards and clear of the hat tags, the board, and the pot. It pops, holds, and can be tapped away. Buttons stay locked until it finishes clearing.

Copy: `You are the {name}. You have {n}bb. {prior}. You are next to act.`

Each opponent has a tag over the hat: short seat and stack until they act, then a sentence such as `UTG folded` or `CO raised 6BB`, with the stack still underneath. A preflop call with no raise yet says limped. Tags snap to the new seats after the swap clip. The hero has no tag.

Fold, Call or Check, and Raise sit in the thumb zone above the hole cards. When Raise is legal, two nearby locked sizes sit just above Raise. One tap on a size commits that raise. The scripted size is correct; the other size ends the story. This is not the Sniper Slider.

Preflop, check is legal only for the big blind when nobody has raised. Any earlier scripted raise makes later seats face a bet. Postflop, check is legal until a raise.

## Stage result

One story is one spot. The current seven-spot mix stays five Equity Scale hands and two Peek and Pitch hands. A finished story records one spot attempt. A loss burns exactly one Chip. Win or lose shows four rows — position, cards, stack, correct action, one sentence — marks the missed seat, and shows one stage takeaway. The arrival card is not that explanation.

## Story contract

`validateStory` returns `{ ok: true, story }` or `{ ok: false, issues }`. A story has exactly four seats and a board of 0, 3, 4, or 5 cards. Frequencies sum to 100 and the unique maximum is the scripted action, which must be legal. `raiseSize` is a positive number only for a raise. Broken stories fail tests. Two placeholder fixtures ship: a garden preflop and a casino flop.
