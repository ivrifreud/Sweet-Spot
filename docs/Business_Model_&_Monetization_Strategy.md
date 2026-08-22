> Superseded where conflicting — see `docs/mvp.md` (Rev. 2). MVP money scope is Chip Rebuy + rewarded video only (Section 7).

SWEET SPOT
Business Model & Monetization Strategy
In-App Purchases · Advertising · Premium Subscription · Affiliate & Partnership Revenue
Companion document to the MVP Feature Specification
August 2026
Contents
1. Purpose & Guiding Principles
2. In-App Purchases (Microtransactions)
3. Advertising
4. Premium Subscription & Premium Content
5. Additional & Adjacent Revenue Streams
6. Regulatory & Responsible-Gambling Considerations
7. MVP vs. Roadmap Phasing
8. Cross-Cutting: What NOT to Do
9. Open Items & Next Steps
1. Purpose & Guiding Principles
This document maps every plausible profit source for Sweet Spot across in-app purchases, advertising, premium subscription content, and adjacent partnership revenue, and gives each a rough sequencing recommendation. It extends the Business Model section of the Psychology, Retention & Monetization Strategy source document rather than replacing it — every mechanic already defined there (the Chip Stack, Rewarded Ads, Premium/Pro, In-Game Purchases) is carried forward and built on.
Monetization Without Breaking Flow
The source strategy's central principle governs everything in this document: revenue mechanisms must never interrupt the fast, continuous micro-learning experience. Every idea below is filtered through that lens before it's a candidate for the roadmap.
Progress-Based Friction, Not Time-Based Friction
The only friction that creates a monetization opportunity is a mistake (a burned Chip) — never an artificial time gate or a session cap. A user who is playing well should never hit a paywall; a user who is struggling meets one exactly where the existing Chip system already places it.
Source: Sweet Spot – Psychology, Retention & Monetization Strategy.docx, Section 5 (“Monetization Strategy — Freemium Hybrid”).
2. In-App Purchases (Microtransactions)
Already Established
•
Chip Rebuy: instant refill of the 3-Chip lives stack for premium currency, once the 12-hour natural regeneration hasn't happened yet. This is the core MVP-adjacent purchase, since it sits directly on top of the Chip system already in MVP scope.
•
Cosmetics & status: chip skins (diamond, flaming chips), premium card backs, and unique leaderboard avatars — purely cosmetic, no gameplay impact.
•
Utility purchases: unlocking a deep-dive “explain the leak” breakdown on a specific mistake.
New Opportunities to Evaluate
•
Direct Gold Coin purchase: letting users buy Gold Coins with real money, not only earn them via the Daily Challenge — for users who want to buy cosmetics or Rebuys without waiting.
•
Streak Freeze: a purchasable pass that protects a user's login streak if they miss a day. This is a proven lever (Duolingo and similar apps) that monetizes the loss-aversion psychology the app already leans on heavily (the “14-Day Fire” streak badge).
•
XP / progress boosts: a limited-time multiplier on points earned, for users who want to climb the leaderboard faster.
•
Seasonal or limited-time cosmetic drops: time-boxed collectible items to create urgency, on top of the always-available cosmetic catalog.
•
Gifting: buying a coin pack or a Pro month for a friend — doubles as a viral mechanic and a revenue one, and pairs naturally with the existing invite-a-friend flow.
•
Extra Daily Challenge attempt: a purchasable second attempt on a given day's challenge, for users who want another shot at the Gold Coin reward.
What NOT to Do
•
Do not sell pay-to-skip access to content — a purchase should never let a user bypass actually demonstrating competence. If a “fast track” purchase is ever built, it should still require passing a placement check, not a flat skip button.
•
Do not let any purchase directly alter a user's Elo rating or leaderboard position — that would break the integrity of the skill system the entire product is built on.
3. Advertising
Primary Format: Rewarded Video
•
A ~30-second opt-in video in exchange for one free Chip — already spec'd and the app's primary ad mechanic.
•
Extend the same mechanic to Gold Coins, giving users a second opt-in ad path outside of Chip recovery.
Secondary Options to Evaluate
•
Offerwall: complete a survey or try a partner app for bonus currency. Common in F2P economies but tends to feel lower-quality; would need a design pass to avoid clashing with the app's premium feel.
•
Sponsored Daily Challenge theming: a poker brand “sponsoring” a specific day's challenge. Needs a legal/brand review before consideration, given gambling-adjacent brand association risk.
4. Premium Subscription & Premium Content
Sweet Spot Pro (Already Established)
•
Ad-free experience, unlimited Chips, and access to the personal weakness/leak dashboard with community benchmarking and AI-targeted practice sessions.
Tiering Ideas
•
Annual plan: discounted annual pricing alongside monthly, a standard lever for improving LTV and reducing churn.
•
Elite / Pro+ tier: a higher tier bundling 1:1 coaching-session credits or, once built, GTO Lab access.
•
Duo / family plan: two accounts under one subscription — pairs naturally with the app's existing social features.
•
À la carte content packs: one-time purchases (e.g., a “Tournament ICM Masterclass”) for users who want depth on one topic without a full subscription.
•
Bankroll Pro: advanced Bankroll-screen features — tax-ready exports, multi-currency support, custom reports — gated behind the subscription. This connects directly to the existing Bankroll Management feature rather than requiring new infrastructure.
Content Partnerships
•
Licensed or revenue-shared masterclass content from real poker professionals, sold either as à la carte packs or as part of an Elite tier.
5. Additional & Adjacent Revenue Streams
Affiliate Partnerships
•
Lower-risk alternative: affiliate deals with poker equipment and book/publisher brands (chip sets, playing cards, strategy books) — much lower regulatory stakes, and easy to place naturally in the Bankroll or cosmetics UI.
Sponsorships
•
Sponsorship of the weekly leaderboard by a poker-adjacent brand — low friction, doesn't touch gameplay or the table UI.
Coaching Marketplace
•
Connecting Premium users with real human coaches for paid 1:1 sessions, with the app taking a marketplace commission. This also gives the parked “GTO Lab” concept (real hands reviewed by a human, not just the algorithm) a natural commercial home.
B2B / White-Label Licensing
•
Licensing the learning engine and content library to poker rooms, casinos, or streaming personalities as a branded training tool.
Data & Insights Licensing
•
Aggregated, fully anonymized trend reports (e.g., “state of amateur poker players”) sold to industry stakeholders. Viable in principle, but requires the same privacy/consent review already flagged in the Data Collection & Analytics Plan before it becomes more than a concept — this cannot proceed on individual-level data under any circumstance.
Live Events, Merchandising & Corporate Training
•
Paid webinars or live masterclasses; branded merchandise (card decks, chip sets, apparel); and a niche B2B angle selling poker-themed corporate team-building sessions using the app. All tertiary — worth a mention, not near-term priorities.
6. Regulatory & Responsible-Gambling Considerations
Several revenue ideas in this document intersect with gambling-adjacent regulation or with the responsible-gambling signals already identified in the Data Collection & Analytics Plan. These need explicit review before implementation, not after:
•
Poker-room affiliate partnerships (Section 5) carry region-by-region regulatory weight and directly target the same behavior pattern (loss-chasing, frequent re-buys) the analytics plan recommends treating as a sensitive internal signal — advertising into that pattern would work directly against the product's own responsible-gambling posture.
•
App-store policy compliance: both Apple and Google apply extra scrutiny to real-money-gambling-adjacent apps. A poker training app with a real-money bankroll tracker and (potentially) real-money affiliate links should have its store-policy classification reviewed early, well before any affiliate work begins, to avoid a store-approval risk to the entire app.
•
Any use of Bankroll or tilt-susceptibility data for ad targeting or personalized offers (e.g., surfacing a Chip Rebuy prompt specifically to a user showing loss-chasing patterns) should be treated as off-limits by default — this would convert a coaching signal into an exploitative one and should require explicit, separate ethical sign-off if ever considered.
•
Data licensing (Section 5) must stay fully aggregated and anonymized, consistent with the privacy section of the Data Collection & Analytics Plan.
•
Regional pricing and tax handling for subscriptions and IAPs should be scoped with finance/legal before a global launch.
7. MVP vs. Roadmap Phasing
A rough sequencing view — this is a starting point for prioritization discussion, not a final roadmap. Revenue Stream Phase Notes Chip Rebuy (IAP) MVP Sits directly on the Chip system already in MVP scope. Rewarded video ads MVP Opt-in only; extend from Chips to Gold Coins early post-launch. Cosmetics (skins, avatars, card backs) Phase 1 (post-MVP) Low build complexity, no economy risk. Sweet Spot Pro (subscription) Phase 1 (post-MVP) Requires the weakness dashboard, also currently out of MVP scope. Direct Gold Coin purchase, Streak Freeze, XP boosts Phase 1–2 Straightforward extensions of the existing currency system. Bankroll Pro, à la carte content packs, Elite tier Phase 2 Depends on Bankroll and content-library maturity. Coaching marketplace, B2B/white-label licensing Phase 2–3 Needs a larger user base and operational build-out. Equipment/book affiliate deals, leaderboard sponsorship Phase 2 Low regulatory risk; mainly a business-development effort. Poker-room affiliate partnerships Deferred — pending legal & responsible-gambling review See Section 6. Not a default roadmap item. Data & insights licensing Deferred — pending privacy review See Section 6.
8. Cross-Cutting: What NOT to Do
•
Do not use forced interstitial ads between stages, or persistent ad banners on the poker table UI.
•
Do not cap total app usage by time; the only friction is the existing Chip system.
•
Do not sell any purchase that bypasses actually demonstrating competence, or that directly alters Elo or leaderboard standing.
•
Do not target Chip Rebuy, Gold Coin, or any other purchase prompt using Bankroll or tilt-susceptibility data.
•
Do not pursue poker-room affiliate or real-money-adjacent partnerships without a completed legal and responsible-gambling review.
•
Do not license or sell data at anything other than a fully aggregated, anonymized level.
9. Open Items & Next Steps
•
Pricing research: what Sweet Spot Pro, Elite, and Gold Coin bundles should cost, including regional pricing.
•
App-store policy classification review for a poker-training app with a real-money bankroll tracker, done early rather than at launch.
•
Legal and responsible-gambling review of any poker-room affiliate or real-money-adjacent partnership, before it moves from this document to a roadmap.
•
Decide the Phase 1 post-MVP monetization priority order (this document proposes cosmetics + Pro subscription first, but that needs product/finance sign-off).
•
Define exact Gold Coin sell price, bundle sizes, and the Chip Rebuy price point.
Companion to: Sweet Spot MVP Feature Specification and Sweet Spot – Data Collection & Analytics Plan. Sources: Sweet Spot – Psychology, Retention & Monetization Strategy.docx (primary) · SweetSpot MVP.pdf · Multiplayer Concepts Specification.docx · Session Times, Progression & Punishment System.pdf · Players Ranking and Elo.docx — plus product-owner input gathered 2026-08-16.