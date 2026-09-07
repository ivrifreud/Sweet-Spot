> Current sprint plan. Build only what this file scopes; for product conflicts defer to `docs/mvp.md` (Rev. 2).

SWEET SPOT
Sprint 2 Proposal — Map Engine, World 2, and Architecture Expansion
Expo 57 Upgrade · Template 2 (Equity Scale) · World 2 (Light Mode) · Dynamic Spot Engine
Two-person team · Prepared for sprint kickoff
September 2026

## Why a hybrid infrastructure approach?

Sprint 1 validated the architecture using hand-authored spots. To scale the MVP, we need the dynamic Spot Engine to generate procedural hands based on user Elo. However, the curriculum structure itself remains static (the "7-spot sandwich"). This sprint divides the labor to reflect this: Ivri builds the dynamic Python engine, while Guy constructs the static Supabase architecture that feeds into it.

## Contents

1. Sprint Goal
2. Capacity & Role Split
3. In Scope vs. Explicitly Out of Scope
4. Day-by-Day Plan — Week 1
5. Day-by-Day Plan — Week 2
6. Definition of Done
7. If You Fall Behind — Cut List
8. Risks & Dependencies
9. Sprint 3 Preview
10. Sprint 1 Wrap-Up Context

## 1. Sprint Goal

By the end of the sprint, the application will have migrated to Expo 57, and the static, hand-authored spots from Sprint 1 will be replaced by the first working version of the dynamic Spot Engine. A user entering a stage will face procedurally generated hands based on their hidden Elo, bounded by static constraint rules stored in Supabase. Furthermore, they will interact with Template 2 ("The Equity Scale") within the newly styled environment of World 2 ("A Local Casino" Light Mode).

## 2. Capacity & Role Split

| | Availability | 10-Day Total | Primary Focus |
| --- | --- | --- | --- |
| Ivri | ~2 hours/day | ~20 hours | Expo 54 to 57 upgrade, Python-based dynamic Spot Engine generation (core algorithms/API), and building Template 2 ("The Equity Scale"). |
| Guy | ~3.5 hours/day | ~35 hours | Spot Engine static data modeling in Supabase, frontend API integration, and complete ownership of World 2 ("A Local Casino" Light Mode) styling, assets, and audio. |

We are maintaining the established time budgets. To balance the workload, Guy will take ownership of the Supabase data modeling for the static curriculum architecture, while Ivri focuses on the mathematical generation engine and building the complex logic for the new Equity Scale UI.

## 3. In Scope vs. Explicitly Out of Scope

### In Scope

- Upgrade the repository from Expo 54 to Expo 57.
- Spot Engine Backend: Procedural hand generation (Python/treys/7eval) based on user Elo and static constraint boundaries (e.g., "Villain stack size > 40bb").
- Spot Engine Frontend: Supabase schema and seeding for the static curriculum skeleton (Pillars, Lessons, and the "7 Spots" static parameters).
- Template 2 ("The Equity Scale"): Development of the Outs Dial and rotational gesture mechanics, locking green on EV+.
- World 2 ("A Local Casino"): Visual styling and sensory design for Light Mode (bright arcade neon, cheerful token clinks).
- Replay Logic: Generating a brand-new hand within the same parameters on the next attempt after a burned chip.

### Explicitly Out of Scope This Sprint

- World 2 Dark & Light Mode.
- Templates 3, 5, and 6.
- Worlds 3 and 4.
- The Daily Challenge and Bankroll Management screens.
- Deployment of the Python backend to a production environment (Railway) is preferred but can be pushed to Sprint 3 if integration testing runs long.

## 4. Day-by-Day Plan — Week 1

| Day | Ivri (~2h) | Guy (~3.5h) |
| --- | --- | --- |
| 1 | Expo Upgrade: Execute the update from Expo 54 to Expo 57, resolve dependency breakages, and stabilize the dev environment. | Supabase Data Modeling: Design and implement the Supabase schema for the static curriculum (Pillars, Lessons, 7-spot structures, and constraint rules). |
| 2 | Spot Engine (Backend): Scaffold the procedural engine structure (Python/treys/7eval) for dynamic generation. | Supabase Seeding & Queries: Write seed scripts to populate Supabase with the first static lessons. Write frontend fetch queries. |
| 3 | Template 2 (UI): Build the frontend layout for "The Equity Scale." Scaffold the Outs Dial and basic rotation gesture mechanics in Expo. | Frontend API Wiring: Build the client-side services required to request and parse the new Spot Engine data, relieving Ivri of client-side data fetching. |
| 4 | Spot Engine (Math): Program the engine to ingest hidden Elo and output generated poker scenarios that respect constraint boundaries. | World 2 Art Direction: Begin visual styling for World 2 ("A Local Casino" Light Mode). Translate the bright arcade neon aesthetic into NativeWind classes. |
| 5 | Template 2 (Logic): Program the internal logic for the Equity Scale so the dial balances price-to-call against pot size and locks green on EV+. | World 2 Integration: Apply the new NativeWind skin to the app shell and Template 1 screens, ensuring the layout adapts correctly. |

## 5. Day-by-Day Plan — Week 2

| Day | Ivri (~2h) | Guy (~3.5h) |
| --- | --- | --- |
| 6 | Spot Engine (Logic): Expose the engine via API and implement the replay logic (generating a brand-new hand within the same parameters after a burned chip). | World 2 Audio & Polish: Integrate the specific sensory design for World 2, such as cheerful token clinks and visual feedback cues. |
| 7 | Engine Integration: Feed the live Spot Engine API outputs directly into the Equity Scale and validate the math rendering on the UI. | Logic Wiring: Connect the frontend Spot Engine queries to the progression UI (updating the Chip Stack and Elo penalty/reward loops). |
| 8 | Progression Logic: Build backend routing for the "sandwich structure" (warm-up to final challenge) and the "remedial detour" branching. | End-to-End QA: Run through the full Supabase curriculum fetch → Spot Engine API request → Template 1 & 2 UI data flow. |
| 9 | Debugging: Fix math/Elo generation bugs in the Spot Engine and gesture/locking bugs in the Equity Scale. | Visual/UX QA Pass: Test World 2 across devices. Fix layout bugs, styling inconsistencies, and check audio triggers. |
| 10 | Final Review: Deploy backend updates, finalize the Expo build, and prep demo. | Final Polish: Capture demo assets and draft retro notes. |

## 6. Definition of Done

- The project successfully runs on Expo 57 without critical dependency errors.
- The Spot Engine generates unique hands procedurally via Python based on static constraints and user Elo, replacing Sprint 1's static data.
- Template 2 ("The Equity Scale") is fully functional, complete with a working Outs Dial that accurately evaluates EV+.
- The app features the visual styling and audio design of World 2 ("A Local Casino" - Light Mode).
- Supabase hosts the static architecture for the 7-spot curriculum.

## 7. If You Fall Behind — Cut List

If the team falls behind, specifically due to complexities in the Expo upgrade or Spot Engine math, drop these items in order:

1. World 2 Audio Design: Basic visual styling is required, but specific token clinks and advanced feedback cues can be deferred.
2. "Remedial Detour" Routing: The branching logic for repeated failures can be cut; focus only on the main "sandwich structure" progression.
3. Cross-device World 2 QA: Validate the new styling on one primary device/simulator only.

Do not cut: The Expo 57 upgrade, the procedural generation capability of the Spot Engine, or the core EV+ math locking in the Equity Scale.

## 8. Risks & Dependencies

- Expo Upgrade Instability: Upgrading from Expo 54 to 57 may introduce unexpected breaking changes in dependencies, particularly regarding navigation or gesture handlers used in Template 1.
- Spot Engine Math Complexity: Developing the Python/treys/7eval engine to accurately balance user Elo against constraint rules is a heavy mathematical lift for Ivri's limited 2-hour daily window.
- Frontend API Handoff: Guy is taking on more client-side API construction. Clear communication regarding the required JSON payloads between the Spot Engine (Ivri) and the frontend (Guy) is crucial.

## 9. Sprint 3 Preview

Following a successful Sprint 2, the architecture will be fully prepared to handle the remaining volume of content:

- Development of Templates 3 and 5 (The Detective Board and Tag the Target) to support Level 3 curriculum.
- World 3 ("A VIP Room" Light Mode) and the Dark Mode treatments for Worlds 1 and 2.
- Deployment of the Python backend to a production environment (if not completed in Sprint 2).

## 10. Sprint 1 Wrap-Up Context

Sprint 1 successfully established the core foundation. The calibration engine routes users correctly, Template 1 functions, the hidden Elo updates, and the data flows through Supabase. We also implemented a functioning daily streak mechanic ahead of schedule. We did not finalize the EAS Build Deployment. Sprint 2 focuses on scaling this foundation dynamically.
