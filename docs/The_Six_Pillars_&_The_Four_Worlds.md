> Superseded where conflicting — see `docs/mvp.md` (Rev. 2). Pillar VI, Template 6, and World 4 are deferred. Gesture “why” detail: `docs/Question_Templates.md`.

System & Development Overview .1
This document outlines the six core UI mechanics (Pillars/Templates) for the "Sweet Spot"
 .poker training application
 The application replaces traditional multiple-choice questions (A, B, C, D) with tactile,  mobile-first mechanics designed to build muscle memory and simulate physical poker  actions. The backend AI engine categorizes every poker "spot" into one of 6 pillars. The  frontend (Expo/React Native) will map the incoming Supabase data (cards, pot size,
 .opponent profiles, etc.) directly into the appropriate interactive templates detailed below
 Global UX, Cosmetics & Psychology .2
 To prevent visual fatigue and maintain low development/rendering costs, the core mechanics  of the six templates remain absolutely static. However, the "skins," sound design, and
 .environments dynamically change based on user progression, status, and preference
 Dual Themes (View Modes): Users can toggle between Light Mode (a playful, casual, and  brightly lit atmosphere) and Dark Mode (an underground, psychological, and tense  .(atmosphere
 Color Psychology: The application utilizes highly saturated colors as immediate feedback 
 :mechanisms
 .Neon Green or Gold: Indicates a correct, positive Expected Value (EV+) decision 
 Bright Red: Signals a mistake. This is intentionally jarring to create a psychological aversion 
 .to failure
 In-App Purchases (IAP) & Cosmetics: While each world provides a basic template of chips  and cards, users can purchase and equip cosmetic sets (e.g., crystal chips, retro playing
 .cards). These custom skins will carry over across all worlds to allow for personal expression
 The 4 Worlds: Visual & Sound Architecture .3
 (World 1: Benny's Garden (The Learning Stage
 Light Mode (Student Vibe): Afternoon setting. Green grass, a simple wooden table,  .illustrated beer bottles
 Sound Design: Chirping birds, soft acoustic guitar, distant and rolling laughter of friends.  .Cards slide softly over wood
 Dark Mode (Creepy Vibe): 2:00 AM in a rough neighborhood. Flickering streetlights over a  .heavily scratched table
 Sound Design: Uncomfortable silence, a distant dog barking, a faulty electrical buzz. UI 
 .interactions sound sharp and metallic
 (World 2: A Local Casino (Transition to Real Money
Light Mode (Arcade Vibe): A colorful, bright arcade lit with soft pastel neon lights. A colorful .pool table in the background
Sound Design: Light synthesizer music, the constant and happy clinking of slot machine 
 ".tokens. A classic, cheerful "Jackpot Effect
 Dark Mode (Underground Vibe): A smoky, cramped back room. Old carpeting, dim red neon 
 .lighting
 Sound Design: The heavy hum of industrial ventilation, the rough sound of chip shuffling. 
 .The "Jackpot Effect" sounds like a heavy, physical bag of coins slamming onto the table
 (World 3: A VIP Room (Psychological Precision Stage
 Light Mode (Luxury Vibe): A penthouse flooded with natural light from massive windows. 
 .Light marble textures and clean, minimalist design
 Sound Design: Ambient lounge music, the crisp sound of a drink being poured into a glass. 
 ".The UI responds with elegant, high-tech "clicks
 Dark Mode (Dramatic Vibe): A private room in almost total darkness, save for a harsh, 
 .dramatic overhead spotlight illuminating the table
 Sound Design: A slow, ticking clock and faint breathing. Interface mistakes (flashing red) 
 .trigger a low, heavy bass drop designed to induce slight physical discomfort
 (World 4: A Final Table (The High-Stakes Arena
 Light Mode (Sports Vibe): A massive eSports stadium. Roving spotlights, lasers, and 
 .confetti
 Sound Design: A massive roaring crowd, applause, and building house music. Successful 
 .actions are rewarded with massive crowd cheers
 Dark Mode (Isolated Vibe): A pitch-black screen where only the "chip stack radar" glows in 
 .complete isolation
 Sound Design: Loud, echoing heartbeats and a rising hum of tension. An incorrect action 
 .triggers a deafening, dissonant screech
 (The 6 UI Mechanics (The Action Pillars .4
 (Template 1: "The Peek and Pitch" (Pre-flop Architecture
 Interface: First-person camera perspective looking down over the user's chip stack and two 
 .face-down hole cards. The current game action is displayed in a floating banner
 :Gestures 
 Peek: A long press lifts the corners of the cards using a 3D animation while simultaneously 
 .blurring the background
Pitch (Fold): A fast swipe upward throws the cards into the muck, accompanied by the audio .of cards sliding across felt
.Play (Call/Raise): Pulling the cards downward toward the user's chip stack 
 (Template 2: "The Equity Scale" (The Mathematical Framework
 Interface: A digital scale embedded directly into the table. One side displays the "Price to 
 ".Call," and the other displays the "Pot Size
 Gestures: The user rotates an "Outs Dial" (styled like a combination padlock) to input the 
 .number of outs they have in the hand
 Feedback: Once the user inputs the correct number of outs resulting in a positive Expected 
 Value (EV+), the scale locks into place with a neon green glow, plays a chime, and unlocks
 .the action button
 (Template 3: "The Detective Board" (Texture & Range Analysis
 Interface: Community cards are placed in the center, surrounded by a half-circle containing 
 .("3 to 4 opponent range categories (e.g., "Top Pair," "Pure Air
 Gestures: The user must draw physical, glowing lines on the screen connecting a specific 
 .action taken by the opponent to the most logical range category
 Feedback: Connecting an action to an illogical range causes the line to snap back like a 
 .broken rubber band while flashing red
 (Template 4: "The Sniper Slider" (Bet Sizing Geometry
 Interface: A vertical or circular slider that wraps around the main pot in the center of the 
 .screen
 Gestures: The user drags their thumb along the slider to determine their bet size. The app  delivers haptic feedback (vibrations) as the slider crosses key geometric thresholds (33%, 50%, 75%, Overbet).
 Feedback: Releasing the slider at the theoretically optimal point (extracting maximum value) 
 .triggers the "Jackpot" audio effect
 (Template 5: "Tag the Target" (Profiling & Exploitation
 Interface: The opponent's avatar is displayed at the top of the screen alongside a brief 
 .dossier. A tray of "Badges" rests at the bottom of the screen
 :Gestures 
 Tagging: Dragging and physically stamping the correct Badge (e.g., "Nit," "Maniac") 
 .onto the opponent's avatar
Exploitation: The screen then splits, requiring the user to select the correct macro-strategy .to exploit the specific Badge they just assigned
 (Template 6: "The Pressure Radar" (High-Stakes Dynamics & ICM
 Interface: An absolute focus on chip stacks. The user's stack is in the dead center, while 
 .opponents surround the user as blips on a radar screen
 Gestures: Contextual Push/Fold mechanics. The user must specifically tap on the radar blip 
 .of the exact opponent they choose to attack with an All-In shove
 Feedback: A correct, mathematically sound target selection lights up the radar in a pulsing  green. An incorrect choice (e.g., shoving into the chip leader while on the money bubble)  .triggers a deafening, red environmental warning alarm
 
