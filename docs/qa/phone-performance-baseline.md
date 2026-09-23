# Phone performance baseline

Target: Android and iPhone preview/release builds. Development Metro builds are diagnostic only.

## Environment

| Field | Before | After |
| --- | --- | --- |
| Branch | `feat/bug-fixing` merged with `origin/dev` (`d51d28f` and local submit-lock commits) | same |
| Android device / OS | fill on device | fill on device |
| iPhone / iOS | fill on device | fill on device |
| Build profile | preview/release | preview/release |
| Date | 2026-09-22 | 2026-09-22 |

## Code-backed expected wins (no device attached in this session)

These are the load-bearing changes that should show up in release traces:

- Equity Scale mounts a bounded 1–2 frame window instead of 29 simultaneous 1197×998 PNGs.
- World map scenery mounts the active chunk plus a travel neighbor, not every chunk.
- `agentDebugLog` and the map debug HUD do not run in release builds.
- Audio players are created on first use; boot only loads mute settings and audio mode.
- Reaction videos wait for `readyToPlay`, seek once, ignore stale generations, and fall back to the poster.
- Peek deal resets cancel `deal` / `peek` / `muck` / `commit` and drop stale completion callbacks.
- Stage play serializes submit → reveal/feedback → next spot so continue/back cannot deadlock on media.

## Five-run median / p95 (seconds)

Record true cold starts only. Leave cells blank until a release device run.

| Flow | Android before med/p95 | Android after | iPhone before | iPhone after |
| --- | --- | --- | --- | --- |
| Cold shell interactive |  |  |  |  |
| First tutorial / calibration |  |  |  |  |
| Benny's Garden first paint |  |  |  |  |
| Local Casino first paint |  |  |  |  |
| Same-chunk node → template |  |  |  |  |
| Cross-chunk node → template |  |  |  |  |
| Next spot interactive |  |  |  |  |

## Release behavior gates

- [ ] Three complete Stage 1 runs on each phone: full glove/hand, no lone-finger dial, no blank scale frame
- [ ] Correct / miss / lockout / perfect / sad-scale videos play or fall back; none block Continue
- [ ] Map returns after leaving a stage
- [ ] No release debug POSTs
- [ ] Dial and map travel stay near 55 FPS with no repeating 50 ms stalls
- [ ] Memory plateaus across five Equity Scale spots and drops after leaving the stage

## Intentional remaining motion

Fog part (`FOG_PART_MS` 920) and camera climb (`CAMERA_CLIMB_MS` 980) are still authored cartoon beats, not load delays. Equity Scale still uses a 280 ms enter beat.

## Known limitations

Physical Android and iPhone release traces were not captured in this implementation session. Fill the tables above on-device before claiming a 30% TTI win.
