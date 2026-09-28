# Sweet Spot iPhone Habit Design

**Status:** Design research — September 2026  
**Applies to:** Portrait iPhone layout, gestures, haptics, session feel, and the daily streak  
**Phone, not a website:** Every rule below is for a phone in the hand  
**Does not override:** [`docs/mvp.md`](mvp.md), then [`docs/sprint-current.md`](sprint-current.md). Visual rules stay in [`docs/art-style-guide.md`](art-style-guide.md) and [`docs/moodboard/README.md`](moodboard/README.md). [`docs/Psychology_Retention.md`](Psychology_Retention.md) explains the loop and does not authorize new economy, worlds, or chrome.

Sweet Spot should feel like a cartoon poker break the player opens again tomorrow. The MVP already caps a day at 10–15 minutes and three Chips. Stickiness comes from finishing a short spot and wanting the next one.

| Measure | Target |
| --- | --- |
| Touch target | 44 × 44 pt minimum |
| Button press | 80–120 ms squash, one overshoot, then settle |
| One stage | 3–5 minutes |
| Streak cliff | Day 7 is the moment to design for |

## 1. Five rules that fit this app

1. **One thumb, one decision.** Primary play sits in the lower half of a portrait iPhone. Status lives at the top. The Peek and Pitch is a vertical gesture, so it stays off the system back-swipe on the left edge.
2. **Answer in three channels at once.** Color, a cartoon beat on 2s, and a short haptic must mean the same outcome. Felt Green plus Antique Gold marks a correct decision. Oxblood marks a miss. Each outcome gets its own haptic. Color is never the only signal.
3. **End on the jackpot, leave the next node open.** Spot 1 is an easy win. Spot 7 is the boss, then the chip rain. The map should still show the next stage so the session feels unfinished.
4. **The streak is one small action.** A streak that demands the full daily goal gets abandoned. One completed stage — or the Daily Challenge, once that screen ships — should extend the flame. The 2–3 stage daily target stays a goal, not a gate.
5. **Keep the 1933 skin.** Habit mechanics can rhyme with a learning app. The pictures stay hand-inked rubber-hose: Casino Teal, Antique Gold, Animation Cream, tobacco wood, cream parchment. Lives are Chips. The flame is separate from the Chip stack.

## 2. Where the thumb actually is

On a modern iPhone most play is one-handed. The top band is a stretch, especially under the Dynamic Island. Counts go up there. The commit goes where the thumb already rests.

| Zone | Reach | What belongs there |
| --- | --- | --- |
| Status | Stretch | Chip stack, streak flame, world name. Glance only. No primary buttons under the Dynamic Island. |
| Table | Read | Cards, board, coach. Illustration and film grain stay here. Decisions do not. |
| Decision | Thumb | Peek, pitch, dial, slider, badges. One Lamp Gold action. Sit above the home indicator, clear of the bezel. |

### Gestures that belong to Sweet Spot

- **The Peek and Pitch.** Long-press to peek, swipe up to fold, pull down to call or raise. Vertical motion stays off the left-edge back swipe.
- **The Sniper Slider.** Haptic selection clicks at 33%, 50%, 75%, and overbet. The track starts inset from the screen edge.
- **The Equity Scale.** Rotate the dial to estimate, then an explicit Call or Fold. The lock does not grade the answer before the choice.

### Gestures that belong to iOS

- **Home indicator.** A pull from the bottom bezel is Home. Keep the pitch commit above the safe area. iOS will not give that edge away for good. At most the indicator hides, and the first swipe can belong to the app.
- **Left edge.** That swipe is Back. Detective Board lines and the slider begin inside the board, not on the bezel.
- **Reduce Motion.** Hold the key pose. Skip overshoot, iris wipes, and chip-rain physics. The decision and the color still land.

### Haptic vocabulary

A haptic is a cause. People learn the pattern. The miss buzz and the jackpot must not share a pattern.

| Pattern | When it fires |
| --- | --- |
| Selection | A light click as the slider crosses a sizing stop, or as the dial crosses an outs tick. Same family as a system picker. |
| Success | One success tap on the frame the coach stretches and the chime rises. The jackpot adds the chip cascade in sound, not a second conflicting buzz. |
| Error | One short error tap with the horizontal shake, then calm. Oxblood, then a warm recovery. |

The retention essay still says neon green and bright red. The art style guide replaces that with Felt Green, Antique Gold, and Oxblood, and the art guide wins. Functional color stays bright against the muted cel palette, and every state also moves, sounds, or changes shape.

## 3. The hook already in the spec

Design the phone around these four beats. Do not add a fifth system.

| Beat | What it is in Sweet Spot |
| --- | --- |
| Trigger | One calm push when the Daily Challenge is waiting. That screen is MVP and out of the current sprint. Until it exists, the map’s open next node is the in-app trigger. |
| Action | Open and play one 3–5 minute stage. Calibration plays like the first hand of a game. No open-text input. |
| Variable reward | The Spot Engine deals a new hand inside the same lesson bounds, so a retry is a new test. Gold Coins come only from the Daily Challenge. |
| Investment | Hidden Elo, the map, and the streak. People return to protect what they already built. The flame is separate from the three Chip lives. |

### Shape of a session

- **Open easy.** Spot 1 reviews a known idea and should feel like a win. New players see only the first three stages, so the first open is small on purpose.
- **Close loud.** Spot 7 is the boss, with no hints. A clean run gets the jackpot: an ascending chime, the coach’s heel kick, and falling chips on a time-squared arc.
- **Leave a gap.** After the boss, land on the path with the next stage named and close. An unfinished bar is the reason to come back. A full-screen “you are done” ends the pull.

## 4. What to use, and what to leave out

| Use | Why it is already in scope |
| --- | --- |
| Streak flame | Consecutive days, celebrated at 7. One small completion extends it. The map already has a streak. |
| Chip lives | Three chips. A wrong standard-stage decision burns one. Empty stack regenerates in 12 hours. This is the only hard stop. |
| Remedial branch | Repeated failure splits the path into a simpler detour, then merges back. |
| Rewarded video | Optional. Never between hands. Never a banner on the table. |

| Leave out | Why |
| --- | --- |
| Guilt mascot and nag pushes | A reminder can name the Daily Challenge. It does not shame a missed day. |
| Streak Freeze shop, friend streaks, leaderboards | Freeze is still “to evaluate.” Social features and leaderboards are MVP Section 10. |
| Bankroll nudges | The journal never reads or writes Chips, Gold Coins, or Elo, and never frames more play. |
| World 4, the Arena, hearts, candy HUD | Final Table and live PvP wait. Lives are chips. Map art stays the gouache garden, the desert-town Local Casino, and the VIP room. |

## 5. Design order

Still inside the current game. No new feature is required for the first three.

1. **Juice the decision beat.** Correct, miss, and jackpot already have motion rules. Pair each with one haptic and the existing chime.
2. **Make the streak cheap to keep.** Show the flame apart from Chips. Extending it takes one finished stage, not the whole 10–15 minute budget.
3. **End the map on an open node.** After Spot 7, return to the path with the next stage named and close.
4. **Audit the live templates for the thumb.** The Peek and Pitch, the Equity Scale, and the Sniper Slider: 44 pt targets, safe areas, no edge-swipe fights, and a Reduce Motion path.
5. **Add the Daily Challenge push when that screen exists.** It is the external trigger in the MVP. Do not invent a second daily loop before it.

## Sources

- [`docs/mvp.md`](mvp.md) Revision 2 — session length, Chip stack, Daily Challenge, Section 10
- [`docs/art-style-guide.md`](art-style-guide.md) — palette, motion, HUD versus illustration
- [`docs/moodboard/README.md`](moodboard/README.md) — canonical art; HUD sheets are layout references only
- [`docs/Psychology_Retention.md`](Psychology_Retention.md) — Hook Model, philosophy only
- Apple Human Interface Guidelines: [Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures), [Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics)
- Published write-ups of Duolingo’s streak experiments (a 7-day streak as the habit cliff, and separating the streak from the full daily goal). Those are product-research lessons, not Sweet Spot metrics.
