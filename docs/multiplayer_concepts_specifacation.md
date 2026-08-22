> Superseded where conflicting — see `docs/mvp.md` (Rev. 2). Daily Challenge is MVP; Sweet Spot Arena (PvP) is deferred.

 Feature Specification: Daily Challenge
1.	Overview The Daily Challenge is a recurring engagement feature designed to test strategic thinking, situational awareness, and opponent profiling. It operates on a fixed, consistent template every day, focusing purely on in-app currency rewards rather than competitive  ranking.
2.	The Standardized Challenge Template Every Daily Challenge will follow a strict, three-part logical flow. The interface and structure will remain identical day-to-day to create a familiar 
 user routine.
 Phase 1: Context, Positioning, and Profiling 
 Establishing the scenario: Where we are positioned versus the opponent. •
Tournament Context: Identifying critical variables, such as navigating a large  •  tournament bubble.
Opponent Reading: Analyzing the opponent through psychological body  • language, micro-expressions, and physical "tells" to establish their mental  state.	•
 Phase 2: Strategic Action 
Deciding the optimal move forward (e.g., fold, call, raise) based on the  •  context established in Phase 1.	•
 Phase 3: Bet Sizing 	•
Determining the precise amount to wager to maximize equity or execute a  •  specific strategy.
3.	Timing and Engagement Mechanics
Duration: The challenge is engineered to take between 1.5 to 2 minutes from start to  •  finish.
Anti-Guessing Mechanism (Speed Lock): If a user submits answers too quickly  •
(below a specific time threshold that indicates skipping or blind guessing), they will receive absolutely no rewards. This ensures the content team's scenarios are 
 genuinely read and analyzed.
4.	Economy and Rewards System
Isolated from Ranking: The Daily Challenge will not award XP and will not affect the   user's Elo rating.	•
 Gold Coins: The sole reward for successfully completing the challenge is Gold Coins. 	•
Resource Management: Gold Coins represent the core in-app wealth. Users will  utilize this currency to purchase "Chips" (which function as Hearts/Lives within the  app's ecosystem).
Future Integration: Gold Coins earned here will lay the groundwork for future utility   in the Arena (e.g., tournament buy-ins or multiplayer wagers).
•
•
5.	Psychological and "Tell" Mechanics Incorporating behavioral psychology into Phase 1, the 
 challenges will frequently feature:
Visual/Contextual Tells: Scenarios requiring the user to identify pacifying behaviors,  •  tension, or overconfidence based on body language descriptions or visuals.
Hand Reading Synergy: Combining these behavioral reads with mathematical  •  positioning to create a complete picture of the opponent's strategy.
 
 
 Feature Specification: Sweet Spot Arena (Multiplayer Concepts)
1. Overview & Objective The Arena is the "Endgame" ecosystem of Sweet Spot. Once a user has completed the core learning modules and accumulated sufficient knowledge, the Arena provides the ultimate testing ground. The objective is to transition from passive learning to active, competitive practice, ensuring long-term user retention. The system utilizes an Elo 
rating transfer mechanic (similar to Chess platforms) combined with an in-app currency buyin system, rewarding skill, GTO (Game Theory Optimal) knowledge, and quick decision making while neutralizing the inherent "luck" or variance of traditional poker.
Below are three proposed concepts for the core multiplayer gameplay loop to be evaluated  by the team.
 Concept A: Mirror Spots (Symmetrical Testing)
Core Philosophy: A pure, variance-free test of theoretical knowledge and execution speed.  Both players face the exact same scenario in a controlled vacuum.
 Gameplay Mechanics: 
 Matchmaking pairs two players of similar Elo ratings. •
Both players are presented with an identical sequence of pre-selected spots  •  (e.g., 5 sequential scenarios).
They are given the exact same hole cards, board texture, stack sizes, and  •  opponent action.
Each player must choose their action (Fold/Call/Raise) and specify the  •  precise bet sizing if applicable.	•
 Scoring & Win Conditions: 
Responses are graded against the GTO baseline or maximum EV (Expected  •  Value) calculation for that specific spot.
 If Player A chooses a higher EV line than Player B, Player A wins the round. •
Tie-Breaker: If both players choose the optimal line (identical action and  •  sizing), the winner of the round is determined by response time.	•
 
 Development & Content Implications: •
 Easiest to balance mathematically since both players face identical inputs. •
Requires a large, well-tagged database of pre-calculated EV spots to prevent  •  repetition.
 Concept B: The Duel (Asymmetrical Mind Game)
Core Philosophy: Emulates the dynamic, psychological nature of live poker. This mode tests a  player's ability to read ranges and adapt to a human opponent's real-time decisions.
 Gameplay Mechanics: 
The engine generates a specific spot and drops the two players into an active  •
hand on opposing sides (e.g., Player A is the pre-flop raiser in position;  Player B is the big blind defender).
 Asymmetry: Players only see their own hole cards and the community cards. •
Player A acts first. That action is transmitted to Player B in real-time, who  •  must then react.	•
 Scoring & Win Conditions: 
The winner is NOT determined by who takes down the virtual pot, as that  •  involves luck.
Instead, the system's engine analyzes the mathematical correctness of both  •  players' actions relative to each other's perceived ranges.
The player who deviates the most from the optimal EV response—effectively  •  making the larger mathematical mistake—loses the duel.	•
 Development & Content Implications: 	•
 Requires a more complex synchronous multiplayer architecture. •
Provides the highest immersion and closely resembles actual gameplay,  •  creating a highly engaging, competitive loop.
 Concept C: Sudden Death (Survival Mode)
Core Philosophy: A fast-paced, high-pressure endurance test. Designed for rapid 
 engagement and testing instinctual knowledge under stress.
 Gameplay Mechanics: •
Both players start the match with an equal pool of "Health Points" (utilizing  •  the Chips/Hearts mechanic).
Players are fed a continuous, randomized stream of spots with an  •  increasingly shorter time limit per question.
The spots are independent of what the other player is seeing (focusing on  •  volume rather than mirroring).
 
 Scoring & Win Conditions: •
Every correct/optimal GTO answer allows the player to survive to the next  •  spot.
A suboptimal answer, a severe EV mistake, or a time-out results in a loss of  •  Health Points.
The match ends when one player's Health Points drop to zero. The last  •  player standing wins the match.
 Development & Content Implications: •
 Highly addictive gameplay loop with a focus on speed. •
Requires a massive pool of varied spots to maintain the rapid-fire pace  •  without feeling repetitive.
2. Arena Economy & Progression (Common to all Concepts) Regardless of the chosen gameplay mechanic, the Arena will integrate strictly with the overarching application 
 economy:
Entry Fee: Players must pay a Buy-in using Gold Coins (earned from the Daily  •  Challenge and other single-player achievements).
 Winner Takes All: The victor claims the Gold Coin prize pool. •
Elo Stakes: In addition to the currency transfer, the match functions as a ranked  • competitive bout. The winner extracts Elo points from the loser, directly impacting  their global leaderboard ranking.
 
