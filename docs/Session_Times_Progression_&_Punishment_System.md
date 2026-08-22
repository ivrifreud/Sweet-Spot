> Superseded where conflicting — see `docs/mvp.md` (Rev. 2).

Sweet Spot - Session Times, Progression & Punishment System  1. Daily Flow & Progression Limits
To maintain healthy retention and prevent burnout, the daily user journey is constrained by  design, aiming for a lightweight daily habit rather than a heavy study session.
 Target Session Time: 10-15 minutes total per day. •
 Content Consumption: •
The Daily Challenge: 1 highly difficult spot per day. This challenge focuses  o on multiplayer concepts. Crucial rule: Failing the Daily Challenge does not 
 cost the user any Chips. It is a risk-free attempt to encourage daily logins.
Standard Map Progression: The user will typically play 2 to 3 standard  o  stages per day. Each stage contains 5 to 7 fast-paced poker spots.
Content Unlocking (Anti-Overwhelm): When a user first registers, they do not see  • an overwhelming open map. Only the first section is unlocked, with only the first 3 stages available. Subsequent stages unlock sequentially only upon the successful 
 completion of the previous one.
2.	The Punishment System (Mistakes & Penalties)
Mistakes carry immediate and long-term consequences to emulate the stakes of real poker. 
The system is divided into short-term friction (monetization) and long-term algorithmic  adjustment (matchmaking).
 A. The "Chip Stack" System (Immediate Penalty / Micro-Punishment)
Inventory: The user has a persistent inventory of 3 Poker Chips (acting as "Lives" or  •  health points).
 Penalty: During standard stages, every incorrect decision immediately burns 1 Chip. •
Failure: If the user loses all 3 Chips, they fail the stage and are locked out of playing  •  further standard stages.
Recovery: Chips regenerate automatically over a 12-hour cool-down, or the user can  •  pay premium currency for an instant "Rebuy" to refill their stack and keep playing.
 B. The Elo Rating Algorithm (Long-Term Penalty / Macro-Punishment)
The hidden Elo rating does not decrease by a fixed flat amount (e.g., not just "-10 points"). 
The AI calculates the point deduction using statistical inference based on two primary  multipliers:
 The Elo Gap Multiplier (Difficulty vs. Player Rating): .1
The system compares the user's current Elo to the hidden Elo rating of the  o  specific question/spot.
If a high-Elo player makes a mistake on a low-Elo (easy) spot, the point  o deduction is severe (e.g., -40 points), as the algorithm expects them to win  95% of the time.
If a player makes a mistake on a spot higher than or equal to their current  o  Elo, the deduction is minimal (e.g., -5 points).
 The EV (Expected Value) Severity Multiplier: .2
 The AI evaluates the statistical magnitude of the mistake. o
Marginal Error: A slight mathematical miscalculation receives a standard  o  penalty (1x multiplier).
Massive Blunder: A mathematically catastrophic decision (e.g., calling an all- o in with terrible pot odds and weak cards) triggers a "Blunder Penalty" (2x or 
3x multiplier), accelerating the Elo drop to quickly recalibrate the user's  difficulty level.
 
