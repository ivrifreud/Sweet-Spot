> Detail for the UI templates. Where scope conflicts with `docs/mvp.md`, MVP wins.
> Template 6 / World 4 / Pillar VI are deferred — see `docs/mvp.md` Section 10.
> Template 7, The Hot Seats, is an extra Pillar I drill. It does not replace The Peek and Pitch.

# Question Templates
## System & Development Overview

This document outlines the UI question templates for the Sweet Spot application. These templates replace traditional multiple-choice (A, B, C, D) formats with tactile, mobile-first mechanics designed to build muscle memory and mimic the physical actions of live poker.

The AI procedural generation engine categorizes every generated poker spot into one of six strategic pillars. The frontend maps the AI's raw data (hole cards, board, pot size, villain action, opponent profile, stack sizes) into the matching UI template below.

### Pillar → template (1:1)

| Pillar | Strategic focus | Template | MVP |
|--------|-----------------|----------|-----|
| I — Pre-Flop Architecture | Hand selection & positional discipline | The Peek and Pitch | Yes |
| II — Mathematical Framework | Pot odds, outs, EV+ decisions | The Equity Scale | Yes |
| III — Board Texture & Range Analysis | Wet/dry boards; thinking in ranges | The Detective Board | Yes |
| IV — Bet Sizing Geometry | Sizing relative to pot | The Sniper Slider | Yes |
| V — Opponent Profiling & Exploitation | Archetypes + exploit adjustments | Tag the Target | Yes |
| VI — High-Stakes Dynamics & ICM | Push/fold & bubble pressure | The Pressure Radar | Deferred (Level 4/5) |

**Level UI template vs per-spot template:** Each Level track names one UI template for its headline leak (Level 1 → Peek and Pitch, Level 2 → Sniper Slider, Level 3 → Detective Board). Per spot, the engine still maps pillar → template 1:1, so Equity Scale (II) and Tag the Target (V) can appear whenever those pillars are the drill inside Levels 1–3. Pressure Radar (VI) does not ship in MVP. The Hot Seats (template 7) is a second Pillar I surface for one four-seat story. It teaches position and prior action. It is not a raise-sizing tool and does not replace Sniper Slider.

Canonical naming and full scope: `docs/mvp.md` Sections 3–5 and 10. Strategic essence below matches the MVP Expanded Breakdown for Pillars I–V.

## Global UX, Environments & Sensory Psychology

To prevent visual fatigue while keeping development costs low, the mechanical interactions of these six templates remain constant, but their visual "skins" and environments evolve as the user progresses.

- **The 4 Environments:** The visual backdrop transitions through four worlds: Benny's Garden, A Local Casino, A VIP Room, and A Final Table of Tournaments. Worlds 1–3 ship in MVP with Pillars I–V; World 4 defers with Level 4/5 and Pillar VI.
- **Light / Dark:** Each World has a Light and Dark day/night treatment of the same layout — see `docs/mvp.md` Section 6. Saturated feedback colors stay functional in both: Neon Green or Gold for a correct EV+ decision, bright Red for a mistake.
- **Audio Design:**
  - Positive Reinforcement: High-pitched, ascending chimes for correct actions.
  - The Jackpot Effect: Perfect sizing or completing a sequence triggers a cascade of casino chips clinking.
  - Adrenaline / Focus: High-pressure spots use heavy, suspenseful sounds (heartbeat, intense chip shuffling) to force hyper-focus.

---

## Template 1: "The Peek and Pitch"
**Mapped to Pillar I: Pre-Flop Architecture** · MVP: Yes

### Why this template / why this pillar
Pillar I establishes foundational pre-flop discipline and positional awareness (UTG vs. Button). It eradicates playing weak hands, limping, and overvaluing low pairs or suited connectors. Pre-flop is a binary gate — fold trash or put money in — so the UI should feel like that gate, not a quiz. Peek forces a deliberate look at the holding; Pitch (swipe up) makes folding a physical discard into the muck; Play (pull down) commits chips toward the stack. That gesture pair builds muscle memory for Pre-Flop Architecture.

- **AI Data Inputs:** Player Position, Hole Cards, Villain Pre-Flop Action.
- **UI/UX Interface:** A first-person camera angle looking down at the user's chip stack and two face-down cards. The current table action is displayed in a sleek floating banner.
- **User Action (Gestures):**
  - Peek: Pressing and holding the screen triggers a 3D animation lifting the corners of the cards. The background blurs to simulate focus.
  - Pitch (Fold): A swift vertical swipe UP pushes the cards forward into the muck, accompanied by the sound of cards sliding on felt.
  - Play (Call/Raise): A vertical pull DOWN brings the cards toward the user's chip stack to engage in the hand.

---

## Template 2: "The Equity Scale"
**Mapped to Pillar II: The Mathematical Framework** · MVP: Yes

### Why this template / why this pillar
Pillar II moves players from intuition to EV+ decisions and pot-odds math. It stops unprofitable chase-calls when the odds say fold. A balancing scale makes cost vs reward spatial; the Outs Dial turns counting outs into a tactile estimate. Critically, the dial does **not** grade the answer mid-turn — the user must still choose Call or Fold. That two-step Lock-In forces an active decision, not a “wait until it turns green” cheat.

- **AI Data Inputs:** Pot Size, Villain Bet Size, Board Texture, Hole Cards (Draws).
- **UI/UX Interface:** A digital balancing scale integrated into the table. One side displays the "Price to Call" (Cost), the other the "Total Pot" (Reward).
- **User Action (Gestures) — two-step Lock-In:**
  1. **Input:** The user turns a tactile "Outs Dial" (styled like a combination lock) to enter how many outs they believe they need. As the dial turns, the scale tips to show the weight of those outs vs the bet cost — **without** revealing whether the input is correct.
  2. **Lock-In & Decision:** The user analyzes the scale balance and actively chooses **Call** or **Fold**, locking in their answer.
- **Feedback Mechanic:** Only after lock-in does the system reveal the result. A mathematically correct decision (e.g. call when EV+, or fold when EV−) lights the scale Neon Green, plays ascending chimes, and advances. An incorrect decision flashes bright Red, burns a Chip (life), and immediately shows a practical mathematical takeaway.

---

## Template 3: "The Detective Board"
**Mapped to Pillar III: Board Texture & Range Analysis** · MVP: Yes

### Why this template / why this pillar
Pillar III teaches wet vs dry board textures and shifts thinking from “my hole cards” to opponent ranges. It trains folding premium starters (e.g. pocket aces) when the board heavily favors the villain’s range. Detective work is the right metaphor: the villain’s line is evidence; hand categories are suspects; the board is the crime scene. Drawing a glowing line from an action to a range externalizes that story; a rubber-band snap on an illogical link trains aversion to incoherent reads.

- **AI Data Inputs:** Community Cards, Villain Post-Flop Action, 3–4 logical/illogical Hand Range Categories.
- **UI/UX Interface:** The community cards sit in the center of the screen. Arranged in a semi-circle around the board are 3 to 4 opponent "Hand Categories" (e.g., Top Pair, Missed Flush Draw, Pure Air).
- **User Action (Gestures):** The user draws physical, glowing lines connecting the opponent's specific action (e.g., "Check-Raised the Turn") to the range that logically fits that story on this board texture.
- **Feedback Mechanic:** An illogical connection snaps back like a rubber band and flashes bright red.

---

## Template 4: "The Sniper Slider"
**Mapped to Pillar IV: Bet Sizing Geometry** · MVP: Yes

### Why this template / why this pillar
Pillar IV masters bet sizing relative to the pot and eliminates random “feels right” sizes with no geometric relation to the pot. A slider wrapped around the pot makes size a continuous physical choice; haptic clicks at 33% / 50% / 75% / Overbet encode the curriculum thresholds into the thumb. Releasing on the exact optimal size (Jackpot Effect) rewards precision, not mere aggression.

- **AI Data Inputs:** Pot Size, Target Value/Fold Equity, Board Texture.
- **UI/UX Interface:** A vertical or circular slider that wraps around the current pot size in the center of the table.
- **User Action (Gestures):** The user drags their thumb along the slider to set bet size. The phone provides haptic feedback (vibration clicks) at 33%, 50%, 75%, and Overbet.
- **Feedback Mechanic:** Releasing at the exact optimal sizing (max value extraction or correctly pricing out a draw) triggers the "Jackpot Effect" audio cascade.

---

## Template 5: "Tag the Target"
**Mapped to Pillar V: Opponent Profiling & Exploitation** · MVP: Yes

### Why this template / why this pillar
Pillar V identifies opponent archetypes and adjusts strategy to exploit them. It prevents misaligned aggression — e.g. bluffing a Calling Station who never folds. Profiling is stamp-then-exploit: classify from the dossier, then pick the macro adjustment. Dragging a Badge onto the avatar makes the label sticky; the split-screen exploit step requires a plan, not just a stereotype.

- **AI Data Inputs:** Villain Avatar, 2–3 sentence Behavioral Dossier, Macro-Strategy Options.
- **UI/UX Interface:** The opponent's avatar sits at the top beneath a brief dossier (e.g., "Folds to 3-bets 80% of the time. Plays tight pre-flop."). A tray of physical "Badges" sits at the bottom.
- **User Action (Gestures):**
  1. Tagging: Drag the correct profile Badge (e.g., Nit, Maniac, Calling Station) and stamp it onto the opponent's avatar.
  2. Exploiting: Once tagged, the screen splits; tap the correct macro-strategy (e.g., "Bluff Aggressively" vs. "Value Bet Thinner").

Canonical naming: tray items are **Badges**, not “Profile Tags.”

---

## Template 6: "The Pressure Radar"
**Mapped to Pillar VI: High-Stakes Dynamics & ICM** · MVP: Deferred (Level 4/5)

### Why this template / why this pillar
Pillar VI is about *who* you shove on under stack and bubble pressure, not only whether your cards are “good.” ICM mistakes often look like shoves into the wrong stack. The radar minimizes hole cards and orbits opponent stacks as blips so attention stays on relative stack sizes and bubble status. Tapping a specific blip forces an explicit target choice.

**Scope:** Deferred with Levels 4–5, Pillar VI, and World 4 — see `docs/mvp.md` Section 10. Spec below is kept for the fast-follow; do not build in MVP.

- **AI Data Inputs:** User Stack Size (in BBs), Opponent Stack Sizes, Tournament Bubble Status.
- **UI/UX Interface:** Hole cards are minimized to focus on stack sizes. The user's stack is in the center; opponent stacks orbit as radar blips. Suspenseful audio simulates high pressure.
- **User Action (Gestures):** Push/Fold by tapping the specific opponent stack (radar blip) to target with the shove — not a generic "All-In" button.
- **Feedback Mechanic:** Correct optimal-stack target pulses the radar green. Wrong target (e.g. shoving into the chip leader on the bubble) triggers a severe visual and auditory warning.

---

## Template 7: "The Hot Seats"
**Mapped to Pillar I: Pre-Flop Architecture** · MVP: Yes · not a replacement for The Peek and Pitch

### Why this template / why this pillar
Pillar I includes position and the action already taken. The same holding changes when the seat changes. The Hot Seats puts the player in four seats of one pre-written one-street story. Each arrival states the position, the stack, the prior action, and that the player is next to act. A correct decision moves clockwise into the next seat. A wrong decision at any seat ends the story.

**Scope:** One story is one stage spot. Win or lose shows every seat's cards, the correct action, and one explanation, plus one stage takeaway. A loss burns one Chip and counts as one of the seven spots. It is not live multiplayer, not the Arena, and not a raise-sizing slider. Raise size is scripted and shown as chips into the pot. Template IDs 1–6 stay as they are. Template 3 remains The Detective Board.

- **Story:** Exactly four seats in action order. Each seat has a position, stack, hole cards, one scripted action, legal actions, frequencies that sum to 100 with a unique maximum on that action, one explanation, and the prior action. No character field. The other three seats are one repeated bowed faceless body.
- **Phone scene:** Portrait, one persistent elliptical table. The active seat stays at bottom center. The next actor is screen left, the following actor is far, and the previous actor is screen right. The camera swings clockwise on a correct answer (720ms: 80 anticipation, 440 travel, 200 settle). Reduced motion fades in 180ms and does not swing the camera. The first seat settles for 200ms and does not whoosh.
- **Arrival card:** A cream parchment card before every decision, including the first. Gestures stay locked until it clears. Tap dismisses it early. Copy: `You are the {name}. You have {n}bb. {prior}. You are next to act.`
- **Gestures:** Peek is a long-press. Fold is a swipe up. Check is a double-tap on the felt, only when legal. Call taps the stack. Raise is a forward flick that sends the scripted chip amount into the pot. Accessible actions exist for every legal action. Targets are at least 44pt.
- **Feedback:** Four rows (position, cards, stack, correct action, one sentence). The missed seat is marked. One stage takeaway. The arrival card is not the explanation.

