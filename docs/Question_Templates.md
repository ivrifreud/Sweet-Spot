> Superseded where conflicting — see `docs/mvp.md` (Rev. 2). Template 6 / World 4 are deferred.

Question Templates 
System & Development Overview 
This document outlines the six core UI question templates for the Sweet Spot application. These templates replace traditional multiple-choice (A, B, C, D) formats with highly tactile, mobile-first mechanics designed to build muscle memory and mimic the physical actions of live poker. 
The AI procedural generation engine will categorize every generated poker spot into one of six strategic pillars. The frontend will map the AI's raw data (Hole cards, Board, Pot Size, Villain Action, Opponent Profile) directly into the corresponding UI template below. 
Global UX, Environments & Sensory Psychology 
To prevent visual fatigue while keeping development costs low, the mechanical interactions of these six templates remain constant, but their visual "skins" and environments will evolve as the user progresses. 
•	The 4 Environments: The visual backdrop will transition through four distinct worlds: Benny's Garden, A Local Casino, A VIP Room, and A Final Table of Tournaments. 
•	Color Psychology: The application utilizes a Dark Mode base to ensure interactive elements stand out. Saturated colors are used functionally: Neon Green or Gold indicates a correct EV+ decision, while bright Red signals a mistake, creating an immediate aversion to failure. 
•	Audio Design: 
o	Positive Reinforcement: High-pitched, ascending chimes for correct actions. 
o	The Jackpot Effect: Perfect sizing or completing a sequence triggers a cascade of casino chips clinking. 
o	Adrenaline/Focus: High-pressure spots utilize heavy, suspenseful sounds (like a heartbeat or intense chip shuffling) to force hyper-focus. 
Template 1: "The Peek and Pitch" 
Mapped to Pillar I: Pre-Flop Architecture 
•	AI Data Inputs: Player Position, Hole Cards, Villain Pre-Flop Action. 
•	UI/UX Interface: A first-person camera angle looking down at the user's chip stack and two face-down cards. The current table action is displayed in a sleek floating banner. 
•	User Action (Gestures): 
o	Peek: Pressing and holding the screen triggers a 3D animation lifting the corners of the cards. The background blurs to simulate focus. 
o	Pitch (Fold): A swift vertical swipe UP pushes the cards forward into the muck, accompanied by the sound of cards sliding on felt. 
o	Play (Call/Raise): A vertical pull DOWN brings the cards toward the user's chip stack to engage in the hand. 
Template 2: "The Equity Scale" 
Mapped to Pillar II: The Mathematical Framework 
•	AI Data Inputs: Pot Size, Villain Bet Size, Board Texture, Hole Cards (Draws). 
•	UI/UX Interface: A digital balancing scale integrated into the table. The left side displays the "Price to Call," and the right side displays the "Total Pot." 
•	User Action (Gestures): The user interacts with a tactile "Outs Dial" (styled like a smartphone combination lock). As the user dials the correct number of outs needed to hit their draw, the physical scale on the screen tips. 
•	Feedback Mechanic: When the dialed outs cross the threshold into EV+ (Expected Value positive), the scale locks into place, glows Neon Green, plays ascending chimes, and unlocks the "Call" button. 
Template 3: "The Detective Board" 
Mapped to Pillar III: Board Texture & Range Analysis 
•	AI Data Inputs: Community Cards, Villain Post-Flop Action, 3-4 logical/illogical Hand Range Categories. 
•	UI/UX Interface: The community cards sit in the center of the screen. Arranged in a 
semi-circle around the board are 3 to 4 opponent "Hand Categories" (e.g., Top Pair, Missed Flush Draw, Pure Air). 
•	User Action (Gestures): The user acts as a detective, drawing physical, glowing lines on the screen to connect the opponent's specific action (e.g., "Check-Raised the Turn") to the range of hands that logically fits that story based on the board texture. 
•	Feedback Mechanic: If the user connects the action to an illogical range, the line instantly snaps back like a rubber band and flashes bright red. 
Template 4: "The Sniper Slider" 
Mapped to Pillar IV: Bet Sizing Geometry 
•	AI Data Inputs: Pot Size, Target Value/Fold Equity, Board Texture. 
•	UI/UX Interface: A vertical or circular slider that wraps around the current pot size in the center of the table. 
•	User Action (Gestures): The user drags their thumb along the slider to set their bet size. The phone provides physical haptic feedback (vibration clicks) as the slider hits key geometric thresholds (33%, 50%, 75%, Overbet). 
•	Feedback Mechanic: The user releases their thumb to lock in the bet. Choosing the exact optimal sizing required to extract maximum value or perfectly price out a draw triggers the "Jackpot Effect" audio. 
Template 5: "Tag the Target" 
Mapped to Pillar V: Opponent Profiling & Exploitation 
•	AI Data Inputs: Villain Avatar, 2-3 sentence Behavioral Dossier, Macro-Strategy Options. 
•	UI/UX Interface: The opponent's avatar sits at the top of the screen beneath a brief dossier (e.g., "Folds to 3-bets 80% of the time. Plays tight pre-flop."). A tray of physical "Badges" sits at the bottom. 
•	User Action (Gestures): 
1.	Tagging: The user drags the correct profile badge (e.g., Nit, Maniac, Calling Station) and stamps it directly onto the opponent's avatar. 
2.	Exploiting: Once tagged, the screen splits, requiring the user to tap the correct macro-strategy adjustment to exploit that specific profile (e.g., "Bluff Aggressively" vs. "Value Bet Thinner"). 
Template 6: "The Pressure Radar" 
Mapped to Pillar VI: High-Stakes Dynamics & ICM 
•	AI Data Inputs: User Stack Size (in BBs), Opponent Stack Sizes, Tournament Bubble Status. 
•	UI/UX Interface: Hole cards are minimized to focus entirely on stack sizes. The user's stack is in the center, surrounded by opponent stacks orbiting as radar blips. Suspenseful audio elements simulate high pressure. 
•	User Action (Gestures): A situational Push/Fold mechanic. Instead of simply pressing "All-In", the user must tap the specific opponent stack (the radar blip) they intend to target with their shove. 
•	Feedback Mechanic: Correctly targeting the optimal stack (e.g., a mid-stack trying to survive the bubble) pulses the radar green. Targeting the wrong stack (e.g., shoving into the massive chip leader) triggers a severe visual and auditory warning. 
 
