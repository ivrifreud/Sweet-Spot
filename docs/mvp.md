> Master product scope for Sweet Spot. Wins over all other `docs/` files when they conflict.

SWEET SPOT
MVP Feature Specification
Calibration · Curriculum · Progression Tracks · Daily Challenge · Bankroll
Prepared for internal product & development review
August 2026 — Revision 2
Scope of this document
This revision folds in the Adaptive Calibration Engine, the Six Pillars curriculum framework, the Six Question Templates, and the Four Worlds visual system — alongside the previously-defined Player Progression Tracks (Levels 1–3), Daily Challenge, and Bankroll Management screen. It draws on all eight source documents plus decisions confirmed with the product owner; every such decision is flagged inline as a Scope Decision box.
 

Contents
1. Introduction & MVP Scope
2. Onboarding — The Adaptive Calibration Engine
3. The Six Pillars — Curriculum Architecture
4. Player Progression Tracks (Levels 1–3)
5. The Six Question Templates
6. Visual & Sensory Design — The Four Worlds
7. Daily Challenge (Multiplayer-Themed)
8. Bankroll Management Screen
9. Shared Systems
10. Explicitly Out of Scope for MVP
11. Open Items Still Needing Input
12. Data Collection & Analytics Plan (Summary)
13. Business Model & Monetization Strategy (Summary)
 

1. Introduction & MVP Scope
Sweet Spot is a mobile-first micro-learning app that teaches poker strategy through bite-sized, gamified decision drills, paired with real-world bankroll tracking. It targets players from complete beginners to advanced-but-not-professional “feel players” who want to trade gut instinct for winning decisions.
The MVP consists of three feature pillars, built on top of a calibration engine and curriculum framework that determine what content each user sees:
Full learning tracks for the three starting player levels — Amateur, Beginner/Feel-Player, and Intermediate/Grinder — roughly the bottom 80% of the player population by design.
One multiplayer-themed feature: the Daily Challenge, a free, risk-free, once-a-day scenario built around reading opponents.
A Bankroll Management screen that lets users log and analyze real-life poker results, fully independent of the app's in-game economy.
Levels 4–5, the Sweet Spot Arena (real-time PvP), the GTO Lab, and most of the deeper monetization surface are explicitly deferred — see Section 10.
 

2. Onboarding — The Adaptive Calibration Engine
Scope Decision
This engine replaces the earlier static onboarding questionnaire entirely. The first-open experience is now a short adaptive skill test built from real procedural poker hands rather than multiple-choice questions. Because only Levels 1–3 ship in MVP, the engine runs two stages, not the three described in the source document — Stage 3 (the GTO Stress Test that validates Levels 4–5) is deferred alongside that content.
How It Works
Rather than asking questions, the engine measures baseline skill through a short tiered sequence of procedural hands and routes the user directly into a starting Elo. Each stage requires a minimum sample of hands and a mistake threshold — not a single slip — before it commits to a placement, so one fluke error can't lock in the wrong level.
Stage	Mechanism	Outcome
1 — Pre-Flop Filter	5–6 sequential pre-flop hands across table positions, testing hand-selection discipline.	2+ catastrophic errors → Level 1. Otherwise → Stage 2.
2 — Math & Position Check	5–6 post-flop hands testing positional awareness and pot-odds math.	Full EV+ pass on all hands → Level 3. Anything less → Level 2.
This gives a clean, exhaustive three-outcome funnel (Level 1 / 2 / 3) with no undefined branches: Stage 1 only decides whether Level 1 is ruled out, and Stage 2 — now the ceiling, since Stage 3 doesn't run — only decides between 2 and 3.
Self-Correction, Not an Appeal Flow
A residual misplacement doesn't need a dedicated contest UI. The Elo Gap Multiplier (Section 9) already penalizes mismatched difficulty asymmetrically, so a wrong placement self-corrects within a handful of real stages. The only added safety valve is a manual “Retake Placement Test” option in settings.
What NOT to Do
No open-text input, and no jargon that isn't intentionally testing for advanced play.
The test should still play like the start of a game — real hands, instant visual/audio feedback — not a graded exam.
Do not run Stage 3 (the Level 4/5 GTO Stress Test) in the MVP build.
 

3. The Six Pillars — Curriculum Architecture
Every procedurally-generated spot is categorized into one of six pillars, which directly target the core leaks defined per Elo level (Section 4) and drive which UI template (Section 5) is deployed.
Pillar	Strategic Focus	MVP Levels
I — Pre-Flop Architecture	Foundational hand selection and positional discipline (UTG vs. Button dynamics).	1–3
II — Mathematical Framework	Moving from intuition to EV+ decisions and pot-odds math.	1–3
III — Board Texture & Range Analysis	Reading wet vs. dry boards; thinking in opponent ranges, not just own cards.	3
IV — Bet Sizing Geometry	Sizing precision relative to pot, replacing random intuitive bets.	2 (+3/4)
V — Opponent Profiling & Exploitation	Identifying opponent archetypes and adjusting strategy to exploit them.	3
VI — High-Stakes Dynamics & ICM	Push/fold strategy and tournament-bubble ICM pressure.	4–5 (deferred)
Five of the six pillars are directly relevant to Levels 1–3 and ship in MVP. Pillar VI is exclusively Level 4+ content and is deferred alongside that rollout — see Section 10.
 

4. Player Progression Tracks (Levels 1–3)
Each level is a self-contained track — unlockable sections and stages built from short poker “spots” that the AI engine generates against that level's leaks. All three tracks share the same structural rules; only content parameters differ.
Level	Elo Range	Core Leaks	Primary Pillar(s)	UI Template
1 — Amateur	0–599	Plays 50%+ of hands; limps/cold-calls; overvalues weak holdings.	I	The Peek and Pitch
2 — Beginner	600–1099	Ignores position; random bet sizing; “Level 1 thinking” (own cards only).	I + IV	The Sniper Slider
3 — Intermediate	1100–1499	Can't fold strong hands on scary boards; chases bad draws; bluffs the wrong opponents.	III + II + V	The Detective Board
Level 1: “I came to have fun, let's see a flop.” Level 2: “I have a feeling the Heart is coming on the River.” Level 3: “How do I extract maximum value from him with my strong hand?” — together, roughly 80% of the player base per the Elo bell-curve model.
Level 3's template was previously an open question; the Six Pillars mapping confirms Detective Board is correct, since Pillar III (board texture / range reading) is exactly the leak Level 3 needs resolved. This open item is now closed.
Track Structure (shared across all three levels)
Bite-sized: each stage holds attention for 3–5 minutes; the 80/20 rule keeps 80% of time on active practice, 20% on theory.
Sandwich structure per stage: warm-up → new concept → rising-difficulty practice → a summarizing “final challenge.”
Progress by stage, not calendar day — no rigid daily quotas. New users see only Section 1's first 3 stages; later stages unlock sequentially on completion.
Daily pacing target: 2–3 stages/day, 5–7 spots/stage, inside a 10–15 minute daily budget shared with the Daily Challenge.
Real-time community stats (“80% of players got this wrong”) and exactly one practical takeaway per stage.
AI Spot Generation Engine
Per spot, the shared engine reads the user's hidden Elo, identifies the leak(s) tied to that bucket, selects the matching pillar/template, and generates the spot parameters (hole cards, board, pot size, villain action) to target it. Equity/probability math runs locally via Python libraries (e.g., treys, 7eval) rather than external APIs; GTO simulations are avoided at runtime.
Core Loop Mechanics
Chip Stack (immediate penalty): 3 persistent Chips act as lives. Every wrong standard-stage decision burns one; losing all 3 locks the user out until Chips regenerate (12h) or are refilled via premium Rebuy. The Daily Challenge is exempt.
Hidden Elo Algorithm (long-term penalty): point changes combine an Elo Gap Multiplier (a mistake on an easy spot costs far more than one on a hard spot) and an EV Severity Multiplier (a catastrophic blunder triggers a 2x–3x penalty). This is the mechanism that moves users between Levels 1→2→3.
What NOT to Do
No time-based usage cap — the only hard stop is running out of Chips.
No forced interstitial ads between stages, and no persistent ad banners on the table UI.
 

5. The Six Question Templates
Each pillar maps to exactly one tactile, mobile-first UI mechanic — replacing traditional multiple-choice answers with gestures that mimic physical poker actions. The mechanical interaction stays constant; only its visual skin changes by World (Section 6).
Template	Pillar	Core Interaction	MVP
1 — The Peek and Pitch	I	Long-press to peek at hole cards; swipe up = fold, pull down = call/raise.	Yes
2 — The Equity Scale	II	Rotate an Outs Dial to balance price-to-call against pot size; locks green on EV+.	Yes
3 — The Detective Board	III	Draw glowing lines linking a villain's action to the logical opponent hand range.	Yes
4 — The Sniper Slider	IV	Drag a slider to set bet size; haptic stops at 33% / 50% / 75% / Overbet.	Yes
5 — Tag the Target	V	Drag a Badge (e.g., Nit, Maniac, Calling Station) onto the opponent, then pick the exploit.	Yes
6 — The Pressure Radar	VI	Tap the radar blip of the specific opponent stack to target with an all-in shove.	Deferred (Level 4/5)
Canonical naming: “The Peek and Pitch” supersedes the earlier name “The Swipe” used in the Ranking & Elo source doc; the tagging tray items are called “Badges,” not “Profile Tags.”
Shared feedback language across all templates: Neon Green/Gold marks an EV+ decision, bright Red marks a mistake; a correct answer plays an ascending chime, and a perfectly executed sequence triggers a “Jackpot” cascade of chip sounds.

Expanded Breakdown: The Strategic Essence of the Five MVP Pillars & Their UI Templates
To provide a deeper understanding of the curriculum architecture, below is a detailed breakdown of the strategic essence for each pillar alongside how it translates into a tactile, mobile-first user experience via its designated Question Template:

Pillar I: Pre-Flop Architecture → Mapped to Template 1: "The Peek and Pitch"
Strategic Essence: Focuses on establishing foundational pre-flop discipline and positional awareness (e.g., UTG vs. Button dynamics). It is designed to eradicate the tendency to play weak hands, limp into pots, or overvalue low pairs and suited connectors.
The Template: The user is presented with a first-person camera angle looking down at their chip stack and two face-down cards. Pressing and holding the screen allows the user to "Peek" at their cards. A vertical swipe UP pushes the cards forward to "Pitch" (fold), while a vertical pull DOWN brings the cards in to play (call/raise).

Pillar II: The Mathematical Framework → Mapped to Template 2: "The Equity Scale"
Strategic Essence: Transitions the user from intuition-based gameplay to logic-based decision-making through EV+ calculations and basic Pot Odds math. It prevents users from unprofitably chasing draws or calling bets when the mathematical odds dictate a fold.
The Template: Features a digital balancing scale integrated into the table, visually weighing the "Price to Call" (Cost) against the "Total Pot" (Reward). The interaction works in a two-step "Lock-In" process to ensure active learning:
Input: The user interacts with a tactile "Outs Dial" to input the number of outs they believe they need to hit their draw. As the dial turns, the physical scale tips to reflect the "weight" of those outs versus the cost of the bet, without revealing if the input is correct.
Lock-In & Decision: The user must analyze the balance of the scale and actively choose either "Call" or "Fold", locking in their answer.
Feedback: Only after locking in does the system reveal the result. A mathematically correct decision (e.g., calling with a positive EV, or folding with a negative EV) lights the scale in neon green and advances the user. An incorrect decision flashes bright red, deducts a Chip (life), and immediately provides a practical, mathematical takeaway explaining the error.

Pillar III: Board Texture & Range Analysis → Mapped to Template 3: "The Detective Board"
Strategic Essence: Teaches the user to read dynamic board textures (Wet vs. Dry) and evolves their thinking from evaluating specific hole cards to thinking in comprehensive opponent "Ranges". It trains players to fold premium starting hands (e.g., Pocket Aces) when the board texture heavily favors the opponent's perceived range.
The Template: The community cards sit in the center, surrounded by a semi-circle of 3 to 4 opponent "Hand Categories" (e.g., Top Pair, Missed Flush Draw, Pure Air). The user acts as a detective, drawing physical, glowing lines to connect the opponent's action to the logical hand range that fits that story. Illogical connections snap back and flash bright red.

Pillar IV: Bet Sizing Geometry → Mapped to Template 4: "The Sniper Slider"
Strategic Essence: Focuses on mastering basic bet sizing logic and refining inaccuracies to ensure maximum value extraction. It aims to eliminate random, intuitive bet sizes that have no mathematical relation to the current pot size.
The Template: Utilizes a vertical or circular slider that wraps around the current pot size. The user drags their thumb along the slider, which provides physical haptic feedback (clicks) as it hits key geometric thresholds (33%, 50%, 75%, Overbet). Releasing the slider at the exact optimal sizing triggers a rewarding "Jackpot Effect" audio cascade.

Pillar V: Opponent Profiling & Exploitation → Mapped to Template 5: "Tag the Target"
Strategic Essence: Centers on identifying specific opponent archetypes and dynamically adjusting strategies to exploit those profiles. It prevents misaligned aggression, such as attempting to bluff a passive player who never folds ("Calling Station").
The Template: The opponent's avatar is displayed alongside a brief behavioral dossier (e.g., "Plays tight pre-flop"). The user must first drag and stamp the correct profile "Badge" (e.g., Nit, Maniac, Calling Station) directly onto the opponent. Once tagged, the screen splits, requiring the user to tap the correct macro-strategy adjustment to exploit that specific archetype.
 

6. Visual & Sensory Design — The Four Worlds
Scope Decision
Light and Dark Mode are a day/night treatment of one shared environment per World — same layout, table, and props — differing only in lighting, color grade, and ambient audio. This was chosen specifically to avoid doubling the art budget that two fully distinct locations per World would require.
World	Arc	Light Treatment	Dark Treatment	MVP
1 — Benny's Garden	The Learning Stage	Afternoon backyard; birds, acoustic guitar.	Same yard at night; quiet, tense, distant sounds.	Yes
2 — A Local Casino	Transition to Real Money	Bright arcade neon; cheerful token clinks.	Same floor, dim red neon; heavier “underground” tone.	Yes
3 — A VIP Room	Psychological Precision	Marble penthouse, natural light, lounge music.	Same room, spotlight only; ticking clock, tense.	Yes
4 — A Final Table	High-Stakes Arena	Stadium, crowd, confetti.	Same stage, isolated radar-only view; heartbeat audio.	Deferred (Level 4/5)
Confirmed: Worlds 1–3 ship in MVP alongside Levels 1–3 and Pillars I–V; World 4 defers alongside Level 4/5 and Pillar VI, consistent with the pattern above.
Color, Audio & Cosmetics
Dark Mode's negative feedback intentionally escalates in intensity by World — later Worlds use heavier, more physical audio cues on mistakes. This is a deliberate exception to the general “don't punish mistakes harshly” content rule, confirmed by the product owner.
Purchased cosmetic sets (chip skins, card backs) carry across all Worlds for personal expression — ties into Section 13's monetization plan.
 

7. Daily Challenge (Multiplayer-Themed)
Scope Decision
The MVP's one multiplayer feature is the Daily Challenge: single-player, no live opponent, no matchmaking infrastructure. The separate real-time PvP “Sweet Spot Arena” (Mirror Spots, The Duel, Sudden Death) is deferred — see Section 10.
A free, risk-free, once-daily scenario testing opponent-reading over a fixed three-part flow: (1) context, positioning, and tell-reading; (2) a strategic fold/call/raise decision; (3) precise bet sizing. Target duration is 1.5–2 minutes, additive to the standard-stage time budget.
Speed Lock: answering faster than a set threshold (a guessing signal) forfeits the reward.
Isolated economy: never awards XP or moves Elo; the sole reward is Gold Coins, spendable on Chip Rebuys and cosmetics.
Crucial rule: failing costs nothing — no Chips are burned. It's designed purely to drive daily logins.
What NOT to Do
No XP or Elo impact; no Chip cost on failure; no live matchmaking or PvP scoring in the MVP build.
 

8. Bankroll Management Screen
Scope Decision
Not covered by any source document — defined with the product owner. Deliberately separate from the in-game economy: a personal-finance journal for real-money results, not a gamified system.
Answers a different question than the rest of the app — not “did the user decide correctly,” but “is the user actually winning money” — and must not read or write Gold Coins, Chips, or Elo.
Session Logging
Game type: structure (Cash / MTT / SNG / Spin & Go), variant (NLHE, PLO, etc.), environment (Live or Online).
Financials: buy-in amount, number of buy-ins, cash-out amount, auto-calculated net profit/loss.
Time & location: date/time, duration, venue or platform, optional notes/tags.
Interactive Bankroll Chart
A stock-app-style line chart (bankroll $ over time), green while net-positive and red while net-negative, with 1W/1M/3M/YTD/1Y/ALL filters and a scrubbing tooltip per session.
KPI overlay: total balance, total net profit (%), hourly win rate.
Filters & Breakdown
Profitability by game type and live vs. online; total time played and average session length; hourly rate; total buy-ins/re-buys; tournament ROI %; win rate.
What NOT to Do
No link to Gold Coins, Chips, or Elo; no real-money payment processing for MVP (entries are self-reported); no framing that reads as encouraging additional play.
 

9. Shared Systems
Not user-facing features on their own, but every feature above depends on them.
Hidden Elo Rating	Backbone of level placement (Section 2) and in-track difficulty; updated only by standard-stage performance, never by Daily Challenge or Bankroll.
Chip Stack (“Lives”)	Gates standard-stage attempts across all three tracks; 12h regen or premium Rebuy. Not used by the Daily Challenge.
Gold Coins	Earned exclusively via the Daily Challenge; spendable on Chip Rebuys and cosmetics. Not linked to Bankroll.
Local Python Equity Engine	Runs spot generation, hand evaluation, and probability math locally (treys / 7eval) for fast response times.
 

10. Explicitly Out of Scope for MVP
Levels 4–5, Pillar VI (High-Stakes/ICM), Template 6 (Pressure Radar), and World 4 (Final Table) — a consistent, fully-specified fast-follow once core levels ship.
Calibration Engine Stage 3 (the GTO Stress Test that validates Levels 4–5).
Sweet Spot Arena: real-time PvP (Mirror Spots, The Duel, Sudden Death) with Elo-stakes matches and Gold Coin buy-ins — “endgame” content requiring synchronous multiplayer infrastructure.
The GTO Lab (parking-lot feature); Premium subscription tier, weakness dashboard, targeted AI training, and cosmetic purchases.
Social/virality features beyond core-track needs: WhatsApp share-a-spot, invite-a-friend unlock, leaderboard.
Any connection between the Bankroll screen and the in-game economy.
 

11. Open Items Still Needing Input
Total stage count per level's track (structure and pacing are defined; total content volume per level is not).
Validate the 5–6 hands/stage figure in the Calibration Engine (Section 2) with content/UX before production.
Exact Gold Coin reward value per Daily Challenge completion.
Currency handling for the Bankroll screen if multi-region users are supported.
 

12. Data Collection & Analytics Plan (Summary)
Scope Decision
A planning input for future analytics/event-schema design, not a committed build item. Full detail is in the companion document: “Sweet Spot – Data Collection & Analytics Plan.”
Six recurring questions drive this plan: which features users love, how much organic interest the app generates, how accurately it calibrates Elo, how to personalize per user, what Bankroll data reveals, and how to build an extended performance profile.
Goal	Headline Signals
Loved features	Return rate & dwell time, replay/share actions, Daily Challenge vs. standard-stage completion, a composite Love Score.
App interest	Onboarding drop-off point, D1/D7/D30 retention, invite K-factor, rolling NPS/app-store sentiment.
Elo mapping	Time-to-decision & sizing precision as continuous signals, a multi-dimensional leak profile, a Glicko-2-style confidence band.
Personalization	Stated goals, best-performing UI template, social engagement segmentation, Bankroll-inferred stakes/variant.
Bankroll-derived	Profitability by stakes/venue/time, re-buy-vs-outcome as a discipline signal, sustainability estimate, real-bankroll vs. in-app-Elo correlation (internal-only).
Extended performance	Accuracy by street/position/action, speed-vs-accuracy quadrants, tilt-susceptibility, math-player vs. people-reader archetype.
Bankroll re-buy patterns and tilt-susceptibility are sensitive — internal coaching signals only, never surfaced as user-facing judgment, with consent handled separately from general analytics.
 

13. Business Model & Monetization Strategy (Summary)
Scope Decision
Only the Chip Rebuy purchase and rewarded-video ads are in current MVP scope — everything else is roadmap-stage. Full detail, phasing, and the regulatory review are in the companion document: “Sweet Spot – Business Model & Monetization Strategy.”
Guiding rule: monetization must never break the fast micro-learning flow, and friction is created only by mistakes (burned Chips), never artificial time gates.
Stream	Headline
In-app purchases	Chip Rebuy, cosmetics, and leak-explanation unlocks (established); Gold Coin purchases, Streak Freeze, XP boosts, and gifting (to evaluate).
Advertising	Rewarded video only — no forced interstitials or persistent banners, ever.
Premium & content	Sweet Spot Pro (ad-free, unlimited Chips, weakness dashboard) plus tiering ideas: annual plan, Elite coaching credits, duo plan, Bankroll Pro.
Adjacent streams	Coaching marketplace, B2B/white-label licensing, leaderboard sponsorship, low-risk equipment affiliates.
Needs legal review	Real-money poker-room affiliate deals and aggregated data licensing — both intersect directly with the responsible-gambling signals in Section 12.
Cross-cutting rule: Bankroll or tilt-susceptibility data must never target a purchase prompt — that would convert a coaching signal into an exploitative one.

Sources: SweetSpot MVP.pdf · Sweet Spot – Psychology, Retention & Monetization Strategy.docx · Multiplayer Concepts Specification.docx · Session Times, Progression & Punishment System.pdf · Players Ranking and Elo.docx · The Six Pillars and the Adaptive Calibration Engine.docx · הרחבה של העולמות.docx · Question Templates.docx · companion documents “Data Collection & Analytics Plan” and “Business Model & Monetization Strategy” — plus scope decisions confirmed with the product owner through 2026-08-18.
