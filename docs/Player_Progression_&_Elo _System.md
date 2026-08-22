> Superseded where conflicting — see `docs/mvp.md` (Rev. 2). Levels 4–5 are post-MVP.

Sweet Spot - Player Progression & Elo System  1. System Overview
Target Audience: The app is designed for "Middle Players" (Feel Players). These are users who know the rules and play with friends or online, but make decisions based on "gut feeling" rather than math. They lose pots on silly mistakes, play too many hands, and want 
 to become profitable, sharp players without becoming statistics robots.
The Goal: The AI engine will generate procedural poker spots based on the user's hidden Elo 
Rating. The system will identify the player's "Leaks" (mistakes) based on their Elo bucket and  generate UI templates to plug those leaks.
 2. The 5 Player Levels & Elo Buckets (Bell Curve Distribution)
 Level 1: Amateur (Bottom 15%)
 Elo Rating: 0 - 599 •
Logic: Wide range, but users gain high points per correct answer to quickly graduate  •  from this tier and feel rewarded.
Player Persona: Knows the basic rules and hand rankings. Plays mostly for action  •  and social experience.
 Mindset: "I came to have fun, let's see a flop." •
 Core Leaks (Mistakes): •
 Plays 50%+ of starting hands. o
 Limps or cold-calls raises just to "see what hits". o
 Falls in love with low pairs or any suited cards. o
Required Skills to Level Up: Pre-flop discipline, folding trash hands, understanding  •  basic hand strength.
 Level 2: Beginner / Feel-Player (The Core - 35%)
 Elo Rating: 600 - 1099 •
Logic: The widest numerical range. This is where the majority of "gut-feeling" players  •  will plateau until they fix their pre-flop leaks.
Player Persona: The classic target audience. Knows not to play every hand, but  •  makes 90% of decisions based on intuition.
 Mindset: "I have a feeling the Heart is coming on the River." •
 Core Leaks (Mistakes): •
 Level 1 Thinking (only looks at their own cards). o
 Completely ignores table position. o
 Bets random amounts with no relation to the pot size. o
Required Skills to Level Up: Understanding table position (UTG vs. Button), basic bet  •  sizing logic.
 Level 3: Intermediate / The Grinder (The Core - 30%)
 Elo Rating: 1100 - 1499 •
Logic: Players here are actively learning. The point gains slow down, forcing them to  •  consistently make EV+ (Expected Value) decisions to climb.
Player Persona: Understands poker is a game of skill. Wants to stop donating chips  •  and is trying to apply logic to decisions.
 Mindset: "How do I extract maximum value from him with my strong hand?" •
 Core Leaks (Mistakes): •
Cannot fold strong hands (like Pocket Aces) even when the board texture  o  becomes extremely dangerous.
Chases straight/flush draws even when the mathematical pot odds do not  o  justify it.
 Bluffs the wrong opponents (e.g., trying to bluff a "Calling Station"). o
Required Skills to Level Up: Reading board texture (Wet vs. Dry), basic Pot Odds  •  math, identifying opponent profiles.
 Level 4: Advanced / Sharp Player (Top 15%) — DEFERRED (post-MVP; not in Sprint 1)
 Elo Rating: 1500 - 1799 •
Logic: Narrower demographic. Small mistakes cost a lot of Elo. The AI engine should  •  severely punish mistakes in ICM or Bluff Catching scenarios here.
Player Persona: Plays aggressively and correctly. Transitioning from thinking about  •  specific cards to thinking in "Ranges".
Mindset: "His flop action doesn't match the story he is trying to sell me on the  •  river."
 Core Leaks (Mistakes): •
 Overcomplicates simple spots ("Fancy Play Syndrome"). o
 Minor bet sizing inaccuracies that prevent maximum value extraction. o
Freezes or makes mistakes under extreme ICM pressure (short stack /  o  tournament bubbles).
Required Skills to Level Up: Smart bluff catching, understanding Blockers, making  •  quick optimal decisions under timer pressure.
 Level 5: Sweet Spot Master / Semi-Pro (Top 5%) — DEFERRED (post-MVP; not in Sprint 1)
 Elo Rating: 1800+ (Uncapped) •
Logic: The elite tier. Only the most consistent players who flawlessly balance ranges  •  and bet sizing reach this open-ended bracket.
Player Persona: The ultimate goal of the app. Makes EV+ decisions almost  •  instinctively.
 Mindset: "I recognize the Sweet Spot in this situation and I am executing it." •
 Characteristics: •
 Reads opponents and board textures cleanly and quickly. o
 Knows exactly when to bet small, overbet, or fold without ego. o
A profitable, sharp, and flexible player who does not need heavy solver  o  calculations mid-game.
3.	AI Spot Generation Instructions
 When the system generates a procedural spot for a user, the AI must:
 Check the user's current Elo rating. .1
 Identify the Core Leaks associated with that Elo bucket. .2
Select the appropriate UI Template (canonical MVP mapping): The Peek and Pitch for  .3  Level 1 pre-flop leaks, The Sniper Slider for Level 2 bet sizing leaks, The Detective Board for Level 3 board-texture / range reading.
Generate the parameters (Hole cards, Board, Pot Size, Villain Action) that specifically  .4  target that leak to help the user learn and level up.
 
