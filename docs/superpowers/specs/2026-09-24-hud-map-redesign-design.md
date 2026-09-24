# HUD rail, sheets, and world-map declutter

**Status:** Approved for implementation  
**Date:** 2026-09-24  
**Branch:** `feature/hud-map-redesign`  
**Parent:** `docs/art-style-guide.md`, `docs/moodboard/README.md`, `docs/mvp.md`

## Goal

Replace the floating cream HUD pills with one smoked-glass marquee rail, open parchment sheets for Profile / Chips / Gold / Streak / Settings, and declutter the world map so large chip-medallion nodes (no stage numbers) are the focus. Drop the walking avatar in favor of a pinned hero badge with a short hop.

## Locked decisions

| Area | Decision |
| --- | --- |
| Rail material | Continuous smoked-glass strip (`expo-blur` + tobacco tint). Android falls back to opaque tint if blur is muddy. |
| Rail order | Profile \| Chips \| Gold Coins \| Streak \| Settings gear |
| Chip timer in rail | Only when Chips = 0. Oxblood ticket stub under chip slot. At 1–2 Chips, countdown lives in Chip Stack sheet only. |
| Surfaces | Parchment sheets over dimmed map; swipe to close. No new full screens. |
| Nodes | ~80px cream clay chip on inked plate. **No stage number on face.** Caption title under node. |
| Locked | Sepia wash + padlock badge; tap → shake + “Finish the previous stage first” (or previous title). |
| Current | Lamp Gold PLAY plate under node. |
| Completed | Gold ring + star row. |
| Hero | Pin above current node; ~450ms hop after stage complete. No walk cycle. |
| Currency name | **Gold Coins** (prop rename from `goldBars`). Value stays `0` until Daily Challenge. |

## Scope guards

- No Elo on Profile (hidden).
- No weakness dashboard, cosmetics shop, leaderboard, or social.
- Chip / Gold / Elo logic is read-only UI wiring.
- Bankroll untouched.

## Measurements

| Token | Value |
| --- | --- |
| Rail min height | 52pt content + safe-area top |
| Slot hit target | ≥44×44pt |
| Node chip size | 80px |
| Caption min font | 12px |
| Hero pin | 48px bust badge |
| Hop duration | 450ms (anticipation → arc → squash → settle) |
| Button press | 80–120ms compress, one overshoot |
| Ticket copy | `FULL IN {formatRegenCountdown}` |

## Sheet contents

- **ChipStackSheet:** 3 chips filled/empty; countdown when chips < 3; Rebuy placeholder.
- **GoldCoinsSheet:** explain Gold Coins + Daily Challenge “coming soon”.
- **StreakSheet:** current + best days (restyle of StreakModal).
- **ProfileSheet:** bust, display name, level, world, stages completed, lessons completed, streak.
- **SettingsSheet:** sound, haptics, Retake Placement (confirm), sign out, version.

## Map hierarchy

1. Warm scrim + vignette demote painted world art.
2. Thicker path stroke.
3. Nodes are the interactable focus.
4. Hero pin marks “you are here” only.

## Test gates

Each phase: `npx tsc --noEmit` + `npm test` green, plus phase-specific unit tests:

1. `railState` — ticket only at 0 chips; countdown formatting.
2. `profileStats` — lessons aggregation from spotsByStage.
3. `nodeLayout` — no overlapping node/label boxes; rail safe zone free.
4. `lockReason` — no “Stage N” in locked copy.

## Non-goals this PR

- Daily Challenge Gold earning.
- Premium Rebuy purchase flow.
- New world map art redraw.
- Expo Router / full navigation stack.
