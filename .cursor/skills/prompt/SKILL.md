---
name: prompt
description: >-
  Turns a spoken or rough feature request into one English handoff prompt
  another Cursor model can plan and then implement. Use when the user types
  /prompt, asks for a prompt to send to another model, or says to write the
  prompt instead of implementing.
---

# Handoff prompt

The user is dictating a job for a different Cursor session that has room to plan and implement. Your job is the prompt. Do not edit the app, do not apply the change, and do not open a plan file in the repo.

Reply with a short note, then one fenced block they can copy. The note says what the prompt covers and any scope decision you made. The block is the entire prompt, in English.

The user may speak Hebrew, English, or a mix, including voice transcripts with repeats and half-sentences. Keep their decisions. Drop the filler. The prompt is precise enough that the other model does not have to guess.

## Before you write

1. Read the request in this turn. If they say "another prompt", scope it to what they just described.
2. Find the real code, assets, and tokens the request touches. Open them. The prompt must name those files and the current behavior.
3. Where their mental model and the code disagree, the prompt states the code fact and the outcome they want. Example: four nodes per map chunk, not four nodes for the whole world.
4. If they float an extra idea and ask whether it is too much, decide. Lock the decision inside the prompt as in-scope or out of scope. Mention that decision in the note above the fence. Do not leave the question open for the other model.
5. Leave behavior they said to keep as an explicit keep. Name the function or motion that stays.

## What the other model is

Staff product designer and senior Expo / React Native engineer for a portrait phone game. They plan with a strong reasoning model, then implement with a strong coding model. They do not write production code until the plan names files, visuals, and numbers. They stay on the current branch, do not pull `origin/dev`, and do not touch dirty files outside the job.

Phone only. Hit targets at least 44pt. Expo web, if previewed, shows the same phone UI.

## Sweet Spot grounding

When the workspace is this repo, the prompt tells them to open only what applies:

- `docs/mvp.md` for scope. Do not build MVP Section 10.
- `docs/art-style-guide.md`, `docs/moodboard/README.md`, and `my-expo-app/theme/artStyle.ts` when anything visual changes. Use tokens. Do not invent a palette.
- `.cursor/skills/sweet-spot-screen-style/SKILL.md` and `.cursor/skills/ui-ux/SKILL.md` for UI work.
- Any other repo skill that clearly applies. Tell them to follow it.

Name a reference product only when the user named one (Duolingo, a radio knob, a glove pose). Tell them to study the structure and keep Sweet Spot's art. Do not import the reference brand.

## Prompt shape

Use these sections, in this order. Skip a section only when it would be empty. Write in affirmative sentences. Keep constraints that stop the other model from wandering.

```text
TITLE
[Feature] — Staff Product Designer and Senior React Native Engineer

STATUS
You are the lead. You design and you ship. You look at the real files, write the plan, then implement that plan.

JOB
[One paragraph: the outcome. Include decisions already made, including ideas rejected as too much.]

HOW YOU WORK
- Phase 1, Plan: strong reasoning model. No production code until the plan is specific.
- Phase 2, Implement: strong coding model. If the repo contradicts the plan, update the plan, then continue.
- Phone, portrait, current branch. Do not pull origin/dev. Do not edit unrelated dirty files.

REQUIRED READING
[Only the docs and skills this job needs.]

WHAT EXISTS TODAY
[Real paths, components, constants, and why the current behavior looks wrong. Include z-order, hit targets, and generated files when they matter.]

THE PROBLEM, IN THE PRODUCT OWNER'S WORDS
[Their intent, cleaned up, still in their terms.]

TASK
[Numbered outcomes. What to move, what color, what must stay tappable, what motion stays.]

PLAN OUTPUT
[What the plan must contain before coding: measurements, colors by token, files in and files out.]

ACCEPTANCE
[Visible results on a phone-sized screen, plus tests when layout math changes.]

OUT OF SCOPE
[Everything you decided not to build, plus nearby systems that look related but must not change.]
```

## Quality bar

- Cite the function, asset, or token that already does the job. Tell them to change that, not to invent a second system.
- Say which layer the user actually sees (a PNG on top of a wash, a wrap above a button) so a recolor or a hit-test fix cannot miss it.
- Separate "painted thing" from "overlay" when both exist.
- Acceptance is something they can check on an iPhone in Expo Go: drag, tap, leave, come back.
- One prompt per `/prompt` turn. Do not append implementation notes inside the fence.

## Note above the fence

Two or three sentences. What the prompt tells the other model to do. The scope call, if you made one. Then the fence. No second copy of the prompt outside the fence.
