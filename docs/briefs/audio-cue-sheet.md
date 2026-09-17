# Level audio cue sheet

CC0 / Mixkit licensed foley. Gesture SFX stay shared across worlds; beds and mistake intensity follow world + lighting.

| Cue                   | File                                           | When                                                                |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| deal                  | deal.wav                                       | Deal animation starts                                               |
| peek                  | peek.wav                                       | Peek hold or pull begins                                            |
| settle                | settle.wav                                     | Peek release                                                        |
| fold                  | fold.wav                                       | Peek and Pitch muck throw                                           |
| chip-pickup           | chip-pickup.wav                                | Stack press / chip grab                                             |
| call                  | call.wav                                       | Peek and Pitch call commits                                         |
| raise                 | raise.wav                                      | Peek and Pitch raise commits                                        |
| correct pool          | correct.wav, correct-casino-coins.wav          | One randomly queued hit sting; do not repeat immediately            |
| incorrect             | incorrect.wav                                  | Miss sting (Epidemic Sound male “no”)                               |
| idle pool             | —                                              | Removed. No snore/yawn after idle.                                  |
| jackpot               | jackpot.wav                                    | Stage-complete overlay (correct real stage)                         |
| jackpot-heavy         | jackpot-heavy.wav                              | Worlds 2–3 dark jackpot (wired when those skins ship)               |
| step                  | step.wav                                       | Benny grass loop, only while the avatar is walking                  |
| node-press            | node-press.wav                                 | Valid garden node press that enters a level                         |
| scale-button          | scale-button.wav                               | Equity Scale Lock In, Fold, and Call buttons                        |
| sad-scale clip        | sad scale.mp4                                  | Equity Scale 0/3 reveal from 00:07; plays with sound unless app mute |
| ui-click              | ui-click.wav                                   | World 3 UI ticks (optional; not on Template 1)                      |
| garden-ambience       | garden-ambience.wav                            | Benny map, day (morning birds)                                      |
| poker-table           | poker-table.wav                                | Benny garden table night (playing-poker bed)                        |
| shuffle               | shuffle.wav                                    | Peek and Pitch and Equity Scale stage start                         |
| casino-day-ambience   | casino-day-ambience.wav                        | World 2 light (assets ready)                                        |
| casino-night-ambience | casino-night-ambience.wav                      | World 2 dark (assets ready)                                         |
| local casino pool     | local-casino-vip-1.wav, local-casino-vip-2.wav | Random bed for Peek and Pitch and Equity Scale; random start offset |
| vip-day-ambience      | vip-day-ambience.wav                           | World 3 light (assets ready)                                        |
| vip-night-ambience    | vip-night-ambience.wav                         | World 3 dark (assets ready)                                         |

Mix: ambience is ducked by action SFX. Benny's map suppresses cloud and arrival SFX; `garden-ambience.wav` and `poker-table.wav` start at a random offset. Hit and miss each play one queued sting. Mute persists. Failures never block play.
