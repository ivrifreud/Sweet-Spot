> Detail for the six UI templates. Where scope conflicts with `docs/mvp.md`, MVP wins.

# Question Templates
## System & Development Overview

This document outlines the six core UI question templates for the Sweet Spot application. These templates replace traditional multiple-choice (A, B, C, D) formats with tactile, mobile-first mechanics designed to build muscle memory and mimic the physical actions of live poker.

The AI procedural generation engine categorizes every generated poker spot into one of six strategic pillars. The frontend maps the AI's raw data (hole cards, board, pot size, villain action, opponent profile, stack sizes) into the matching UI template below.

### Pillar → template (1:1)

| Pillar | Strategic focus | Template |
|--------|-----------------|----------|
| I — Pre-Flop Architecture | Hand selection & positional discipline | The Peek and Pitch |
| II — Mathematical Framework | Pot odds, outs, EV+ decisions | The Equity Scale |
| III — Board Texture & Range Analysis | Wet/dry boards; thinking in ranges | The Detective Board |
| IV — Bet Sizing Geometry | Sizing relative to pot | The Sniper Slider |
| V — Opponent Profiling & Exploitation | Archetypes + exploit adjustments | Tag the Target |
| VI — High-Stakes Dynamics & ICM | Push/fold & bubble pressure | The Pressure Radar |

**Primary template vs per-spot template:** Each Level track names one *primary* UI template — the mechanic students see most for that track's headline leak (Level 1 → Peek and Pitch, Level 2 → Sniper Slider, Level 3 → Detective Board). That does **not** mean the track only uses that template. Per spot, the engine picks a pillar for the leak being drilled, then deploys that pillar's template. So a Level 3 stage can open on Detective Board (III), then use Equity Scale (II) for a draw-chase spot and Tag the Target (V) for an exploit spot. Pressure Radar (VI) can appear as ICM / push-fold drills inside MVP content even though dedicated Levels 4–5 tracks remain deferred.

Full gesture, input, and feedback specs live in the template sections below. Product scope (what ships in MVP) lives in `docs/mvp.md` Sections 3–5 and 10.

## Global UX, Environments & Sensory Psychology

To prevent visual fatigue while keeping development costs low, the mechanical interactions of these six templates remain constant, but their visual "skins" and environments evolve as the user progresses.

- **The 4 Environments:** The visual backdrop transitions through four worlds: Benny's Garden, A Local Casino, A VIP Room, and A Final Table of Tournaments. (World 4 ships with the Level 4/5 fast-follow; templates 1–6 can still run under Worlds 1–3 skins in MVP.)
- **Light / Dark:** Not a dark-only app. Each World has a Light and Dark day/night treatment of the same layout — see `docs/mvp.md` Section 6. Saturated feedback colors stay functional in both: Neon Green or Gold for a correct EV+ decision, bright Red for a mistake.
- **Audio Design:**
  - Positive Reinforcement: High-pitched, ascending chimes for correct actions.
  - The Jackpot Effect: Perfect sizing or completing a sequence triggers a cascade of casino chips clinking.
  - Adrenaline / Focus: High-pressure spots use heavy, suspenseful sounds (heartbeat, intense chip shuffling) to force hyper-focus.

---

## Template 1: "The Peek and Pitch"
**Mapped to Pillar I: Pre-Flop Architecture**

### Why this template / why this pillar
Pillar I fixes the amateur leak of playing too many hands and ignoring position. Pre-flop is a binary gate — fold trash or put money in — so the UI should feel like that gate, not a quiz. Peek forces a deliberate look at the holding; Pitch (swipe up) makes folding a physical discard into the muck; Play (pull down) commits chips toward the stack. Repeating that gesture pair builds the muscle memory of *folding is a real action*, which is exactly Pre-Flop Architecture.

- **AI Data Inputs:** Player Position, Hole Cards, Villain Pre-Flop Action.
- **UI/UX Interface:** A first-person camera angle looking down at the user's chip stack and two face-down cards. The current table action is displayed in a sleek floating banner.
- **User Action (Gestures):**
  - Peek: Pressing and holding the screen triggers a 3D animation lifting the corners of the cards. The background blurs to simulate focus.
  - Pitch (Fold): A swift vertical swipe UP pushes the cards forward into the muck, accompanied by the sound of cards sliding on felt.
  - Play (Call/Raise): A vertical pull DOWN brings the cards toward the user's chip stack to engage in the hand.

---

## Template 2: "The Equity Scale"
**Mapped to Pillar II: The Mathematical Framework**

### Why this template / why this pillar
Pillar II moves players from “I feel like I’m getting there” to EV+ math. Calling a bet is a price-vs-reward problem: outs × implied equity vs the price to call. A balancing scale makes pot odds spatial — one pan is the cost, the other is the pot — and the Outs Dial turns counting outs into a tactile input. Locking green only when the dial crosses EV+ teaches that the “right” call is a threshold, not a vibe. That is the Mathematical Framework in gesture form.

- **AI Data Inputs:** Pot Size, Villain Bet Size, Board Texture, Hole Cards (Draws).
- **UI/UX Interface:** A digital balancing scale integrated into the table. The left side displays the "Price to Call," and the right side displays the "Total Pot."
- **User Action (Gestures):** The user interacts with a tactile "Outs Dial" (styled like a smartphone combination lock). As the user dials the correct number of outs needed to hit their draw, the physical scale on the screen tips.
- **Feedback Mechanic:** When the dialed outs cross the threshold into EV+ (Expected Value positive), the scale locks into place, glows Neon Green, plays ascending chimes, and unlocks the "Call" button.

---

## Template 3: "The Detective Board"
**Mapped to Pillar III: Board Texture & Range Analysis**

### Why this template / why this pillar
Pillar III attacks “Level 1 thinking” (only my cards) by forcing range stories on a given board texture. Detective work is the right metaphor: the villain’s line is evidence; hand categories are suspects; the board is the crime scene. Drawing a glowing line from an action to a range makes the player externalize *what hands make that story make sense*. A rubber-band snap on an illogical link trains aversion to incoherent range reads — Board Texture & Range Analysis as investigation, not multiple choice.

- **AI Data Inputs:** Community Cards, Villain Post-Flop Action, 3–4 logical/illogical Hand Range Categories.
- **UI/UX Interface:** The community cards sit in the center of the screen. Arranged in a semi-circle around the board are 3 to 4 opponent "Hand Categories" (e.g., Top Pair, Missed Flush Draw, Pure Air).
- **User Action (Gestures):** The user acts as a detective, drawing physical, glowing lines on the screen to connect the opponent's specific action (e.g., "Check-Raised the Turn") to the range of hands that logically fits that story based on the board texture.
- **Feedback Mechanic:** If the user connects the action to an illogical range, the line instantly snaps back like a rubber band and flashes bright red.

---

## Template 4: "The Sniper Slider"
**Mapped to Pillar IV: Bet Sizing Geometry**

### Why this template / why this pillar
Pillar IV replaces random “feels right” bets with geometric sizing relative to the pot. A slider wrapped around the pot makes size a continuous physical choice, and haptic clicks at 33% / 50% / 75% / Overbet encode the curriculum’s key thresholds into the thumb. Releasing on the optimal size (Jackpot Effect) rewards precision, not just “any aggression.” That is Bet Sizing Geometry: the bet is a measured shot, not a mood.

- **AI Data Inputs:** Pot Size, Target Value/Fold Equity, Board Texture.
- **UI/UX Interface:** A vertical or circular slider that wraps around the current pot size in the center of the table.
- **User Action (Gestures):** The user drags their thumb along the slider to set their bet size. The phone provides physical haptic feedback (vibration clicks) as the slider hits key geometric thresholds (33%, 50%, 75%, Overbet).
- **Feedback Mechanic:** The user releases their thumb to lock in the bet. Choosing the exact optimal sizing required to extract maximum value or perfectly price out a draw triggers the "Jackpot Effect" audio.

---

## Template 5: "Tag the Target"
**Mapped to Pillar V: Opponent Profiling & Exploitation**

### Why this template / why this pillar
Pillar V teaches that the same hand plays differently against a Nit vs a Maniac. Profiling is stamp-then-exploit: first classify the opponent from the dossier, then choose the macro adjustment. Dragging a Badge onto the avatar makes the label feel assigned and sticky; the split-screen exploit step prevents stopping at the stereotype without a plan. That is Opponent Profiling & Exploitation — read the person, then change the strategy.

- **AI Data Inputs:** Villain Avatar, 2–3 sentence Behavioral Dossier, Macro-Strategy Options.
- **UI/UX Interface:** The opponent's avatar sits at the top of the screen beneath a brief dossier (e.g., "Folds to 3-bets 80% of the time. Plays tight pre-flop."). A tray of physical "Badges" sits at the bottom.
- **User Action (Gestures):**
  1. Tagging: The user drags the correct profile badge (e.g., Nit, Maniac, Calling Station) and stamps it directly onto the opponent's avatar.
  2. Exploiting: Once tagged, the screen splits, requiring the user to tap the correct macro-strategy adjustment to exploit that specific profile (e.g., "Bluff Aggressively" vs. "Value Bet Thinner").

Canonical naming: tray items are **Badges**, not “Profile Tags.”

---

## Template 6: "The Pressure Radar"
**Mapped to Pillar VI: High-Stakes Dynamics & ICM**

### Why this template / why this pillar
Pillar VI is about *who* you shove on under stack and bubble pressure, not only whether your cards are “good.” ICM mistakes often look like hero calls/shoves into the wrong stack. The radar minimizes hole cards and orbits opponent stacks as blips so attention stays on relative stack sizes and bubble status. Tapping a specific blip to target the shove forces an explicit ICM choice; green pulse vs severe warning teaches that the optimal shove target is a stack decision. That is High-Stakes Dynamics & ICM in one gesture.

MVP note: Pressure Radar ships in MVP for Pillar VI spots (e.g. push/fold and bubble drills inside existing tracks or Daily Challenge). Dedicated Levels 4–5 tracks and World 4 (Final Table) remain deferred — see `docs/mvp.md` Section 10.

- **AI Data Inputs:** User Stack Size (in BBs), Opponent Stack Sizes, Tournament Bubble Status.
- **UI/UX Interface:** Hole cards are minimized to focus entirely on stack sizes. The user's stack is in the center, surrounded by opponent stacks orbiting as radar blips. Suspenseful audio elements simulate high pressure.
- **User Action (Gestures):** A situational Push/Fold mechanic. Instead of simply pressing "All-In", the user must tap the specific opponent stack (the radar blip) they intend to target with their shove.
- **Feedback Mechanic:** Correctly targeting the optimal stack (e.g., a mid-stack trying to survive the bubble) pulses the radar green. Targeting the wrong stack (e.g., shoving into the massive chip leader) triggers a severe visual and auditory warning.
