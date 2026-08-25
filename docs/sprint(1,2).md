SWEET SPOT
Sprint 1 Proposal — Two-Week Vertical Slice
Calibration Engine → Level 1 Track → Template 1, End-to-End on Real Infra
Two-person team · Prepared for sprint kickoff
August 2026
Why a vertical slice, not broad coverage
The full MVP spec (calibration engine, three level tracks, six templates, three worlds, Daily Challenge, Bankroll screen) is far larger than two developers — one at 2 hours/day, one at ~3.5 hours/day, starting from a completely empty repo — can build in ten working days (roughly 55 combined hours). Rather than leave every feature half-built, this sprint targets one thin slice, fully working end to end on real infrastructure, as the foundation the rest of the MVP builds on in later sprints.

Contents
1. Sprint Goal
2. Capacity & Role Split
3. In Scope vs. Explicitly Out of Scope
4. Day-by-Day Plan — Week 1
5. Day-by-Day Plan — Week 2
6. Definition of Done
7. If You Fall Behind — Cut List
8. Risks & Dependencies
9. Sprint 2 Preview

1. Sprint Goal
By the end of the sprint, a brand-new user can open the app, complete the two-stage Adaptive Calibration Engine, land in Level 1, 2, or 3, and — if placed in Level 1 — play a full real stage of Level 1's track using Template 1 (“The Peek and Pitch”), with Chips burning on mistakes and hidden Elo updating correctly. The whole flow runs on a real Supabase backend and is reachable as a shared EAS preview build, not a local-only demo.
This single path is deliberately the one built end-to-end, since it exercises every architectural layer once: auth, schema, the calibration funnel, the Chip/Elo core loop, one full UI template, and deployment. Levels 2–3 and the other five templates reuse this same foundation in later sprints.

2. Capacity & Role Split
	Availability	10-Day Total	Primary Focus
Ivri	~2 hours/day	~20 hours	Architecture, schema, core algorithms (Elo, Chip Stack, calibration routing), deploy/RLS, code review.
Guy	~3.5 hours/day	~35 hours	UI/UX & visual design — v0.dev-directed screen design, hand-built in Expo/React Native, gesture feel and motion, World 1 skinning, content presentation, QA.
The split follows leverage and specialty, not seniority for its own sake. Ivri's limited hours go to the pieces that are hard to parallelize or expensive to redo — data model, the algorithms everything else depends on, and final integration/deploy. Guy's larger time budget and design focus go to the UI/UX and visual layer: screen construction, gesture feel, World 1 skinning, and how content is presented — plus QA. In practice, Guy owns the visual and interaction design decisions within the spec's guardrails (color, motion, layout, iconography), while Ivri owns the engineering decisions (schema, algorithms, data flow) — with clear, narrow tickets handed off between them rather than open-ended ones, since that's what makes the hour asymmetry work.
v0.dev generates React web components (JSX, Tailwind, HTML/DOM) — none of that runs directly in Expo/React Native, which uses its own primitives (View, Text, StyleSheet, no DOM). v0.dev is used here purely as a fast way for Guy to nail the visual direction (colors, spacing, layout) on web; every screen still gets hand-built in Expo from that reference, not ported. Adopting NativeWind (Tailwind's className syntax for React Native) is worth it here, since it lets Guy reuse v0's Tailwind classes directly on RN components instead of hand-translating everything into StyleSheet objects.
Guy should do this translation pass inside Cursor rather than by hand: paste the v0.dev output in with the project open and ask it to convert the screen to Expo/React Native using NativeWind classes. Cursor's AI is well-suited to exactly this kind of mechanical div→View, button→TouchableOpacity translation with the class names carried across. It won't be a perfect first pass — some Tailwind features (box-shadow, hover states, certain flex/grid edge cases) don't map cleanly to NativeWind — so budget review/fix time on the simulator, not zero time. This does not extend to gestures: Cursor can scaffold react-native-gesture-handler/Reanimated boilerplate, but the actual feel (timing, animation curves) is still Guy's hands-on iteration, not something the AI can judge. A Cursor subscription with enough usage for daily work should be budgeted as a small sprint cost.
Daily overlap: even 15–20 minutes of live sync each day (async the rest) prevents Guy from blocking on Ivri's narrow 2-hour window.
Code review happens same-day where possible — with only 2 hours/day, a review bottleneck on Ivri's side is the single biggest risk to this plan (see Section 8).

3. In Scope vs. Explicitly Out of Scope
In Scope
Repo, Expo/React Native app shell, Supabase project (Auth, schema, RLS), EAS Build set up for shareable preview builds.
Calibration Engine: both MVP stages, with the routing logic confirmed in the spec (2+ errors → Level 1; otherwise Stage 2; full pass → Level 3; anything less → Level 2).
Level 1 track: one real stage (5–7 spots) using the “sandwich” structure (warm-up → concept → practice → final challenge).
Template 1 (“The Peek and Pitch”): all three gestures — peek, fold, call/raise — with the shared feedback language (green/chime on correct, red on mistake).
Chip Stack (3 lives, burn on mistake, lock at 0) and the hidden Elo update after each real-stage spot.
World 1 (Benny's Garden), Light Mode only.
Explicitly Out of Scope This Sprint
Procedural AI spot generation: the full Python/treys/7eval engine is real work on its own. This sprint's spots (calibration + Level 1 Stage 1) are hand-authored and seeded directly into Supabase. Swapping in procedural generation is a self-contained later sprint that doesn't change anything built here.
Levels 2 and 3, Templates 2–6, Worlds 2–3, and Dark Mode for World 1.
Daily Challenge, Bankroll Management screen, Gold Coins, Chip Rebuy purchases, any monetization.
Sound design beyond basic correct/incorrect cues, if time allows — see the cut list in Section 7.

4. Day-by-Day Plan — Week 1
Day	Ivri (~2h)	Guy (~3.5h)
1	Repo + Expo app shell (with NativeWind configured); create Supabase project; define core schema (users, elo_ratings, chip_stacks, spots, calibration_sessions, stage_progress).	Local dev environment setup; art-direct a v0.dev mockup for the table screen — World 1 Light Mode look, chip stack, hole cards, action banner — as a visual reference, not shippable code.
2	Wire Supabase Auth (sign up/sign in); scaffold the seed-content structure for hand-authored spots; stub RLS policies.	In Cursor, translate the v0.dev output into real Expo/React Native components (View/Text + NativeWind classes); fix what doesn't map cleanly on the simulator; wire basic navigation (Splash → Auth → Calibration).
3	Implement Calibration Engine routing logic as testable pure functions; author the 10–12 calibration spots (Stage 1 pre-flop, Stage 2 post-flop) with answer keys.	Use Cursor to scaffold the gesture-handler/Reanimated boilerplate for the three gestures, then hand-tune the actual feel — long-press peek, swipe-up fold, pull-down call/raise — on device.
4	Connect calibration routing to Supabase (persist result, set starting Elo); review Guy's gesture work.	Design and build the placement-result screen (the level-reveal moment); wire calibration spots into the display layer.
5	Implement Chip Stack backend (burn/lock/regen) and the hidden-Elo update function for real-stage spots; author the Level 1 Stage-1 spot content.	Design and build the correct/incorrect feedback screen — green + chime, red on mistake — per the shared sensory-feedback language.
End of Week 1: a short informal check-in (both) to run the calibration flow start to finish and re-confirm Week 2's plan still fits.

5. Day-by-Day Plan — Week 2
Day	Ivri (~2h)	Guy (~3.5h)
6	Wire Chip Stack UI state (3-chip display, burn trigger) to the backend; connect the Elo update call after each real spot.	Design and build the Level 1 Stage-1 gameplay screen, reusing Template 1 from calibration; wire the 5–7 real spots to it.
7	Implement the lock-out-at-0-Chips state and the 12-hour regen check; push a new EAS preview build for shared testing.	Design and build the stage “sandwich” wrapper — warm-up intro card, spots, summary/final-challenge card — around Stage 1.
8	Bug-fix from EAS preview testing; tighten RLS so users can only read/write their own progress and Elo.	Apply World 1 Light Mode's full visual skin (afternoon backyard — color grade, background art, spacing) to the shared Template 1 UI; select and integrate basic correct/fold sound effects.
9	Full end-to-end integration test: new user → calibration → placement → Stage 1 → Chips burn correctly → Elo updates correctly; fix integration bugs.	Visual/UX QA pass across devices and screen sizes — does the design hold up; fix UI bugs found; keep a running known-issues list.
10	Final review, deploy the sprint-review build, prep the demo script.	Final visual polish; prepare demo screens/assets; help write sprint retro notes.
End of Week 2: a live sprint review (both, ~30–45 minutes) walking a fresh test account through the full slice.

6. Definition of Done
A new user can sign up, complete both calibration stages, and land at the correct level per the routing table in the MVP spec.
A Level 1 placement leads into a real, playable Stage 1 (5–7 spots) using Template 1's three gestures.
Chips burn on incorrect answers, the stage locks at 0 Chips, and hidden Elo updates after each real-stage spot — visibly, even if there's no polished Elo display yet.
The whole flow works on a shared EAS preview build against the real Supabase project, not just on localhost.
RLS is in place so a user cannot read or write another user's progress or Elo.

7. If You Fall Behind — Cut List
Infra setup (Days 1–2) is the most common place a from-scratch sprint slips. If you're behind by the Week 1 check-in, cut in this order — each item is safe to drop without invalidating the pieces already built:
1. Sound effects and World 1's visual skin — ship the calibration + Stage 1 flow with placeholder styling; skinning is purely additive later.
2. Cross-device QA polish — verify on one device only; broaden later.
3. The 12-hour Chip regen check — hardcode Chips as always-available for the demo if the lock-out state itself is proven to work.
4. Trim Stage 1 from 5–7 spots down to 3–4 — the mechanic matters more than the volume for this sprint's purpose.
Do not cut: the Calibration Engine's routing logic, the Chip-burn-and-lock mechanic, or RLS — these are the three pieces that actually validate the architecture for every future sprint.

8. Risks & Dependencies
Review bottleneck: Ivri's 2 hours/day is the tightest constraint in the whole plan. If Guy's work queues up waiting on review, his extra hours stop being useful. Keep tickets narrow enough to review in minutes, not blocks of an hour.
Setup overrun: Supabase/Auth/RLS configuration commonly takes longer than expected on a first setup. Day 1–2 is intentionally Ivri-led for this reason.
v0.dev is a design reference only, not portable code: it generates React web (JSX/Tailwind/DOM), which doesn't run in React Native. Every screen still has to be hand-built in Expo — Guy uses Cursor plus NativeWind (Section 2) to speed up that translation, but it still needs review time on the simulator, not a copy/paste.
Design vs. engineering handoff: with Guy owning the visual/interaction layer, make sure design decisions that touch data shape (e.g., what a spot object needs to render) are agreed with Ivri before Guy builds against them, to avoid rework.
Both are new to this exact stack combination (Expo, EAS, Supabase, v0.dev, Cursor) if this is genuinely the first build — expect Day 1–2 to run over more than a typical sprint's setup phase.

9. Sprint 2 Preview
Once this slice is proven, Sprint 2 is largely repetition of the same pattern at lower risk, since the architecture is already validated:
Levels 2 and 3 content, reusing the Calibration Engine and Elo/Chip systems already built.
Templates 2 and 4 (The Equity Scale, The Sniper Slider) — the other two templates Levels 2–3 need.
A first pass at procedural spot generation (Python, treys/7eval), replacing the hand-authored seed spots from this sprint — this is also when the Python backend gets deployed to Railway, since it isn't needed for this sprint's hand-authored content.
Dark Mode for World 1, then Worlds 2–3, per the shared-environment day/night approach.

Based on: Sweet Spot MVP Feature Specification (Rev. 2), and capacity/scope decisions confirmed 2026-08-18 — Ivri at 2 hours/day and Guy at ~3.5 hours/day with a design focus, starting from a fully empty repository, targeting one working vertical slice rather than partial breadth.