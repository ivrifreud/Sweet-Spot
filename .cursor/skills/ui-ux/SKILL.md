---
name: ui-ux
description: Routes Sweet Spot UI work through the installed UI/UX Pro Max plugin with Expo / React Native constraints and the existing 1930s rubber-hose brand. Use when designing, polishing, reviewing, or fixing screens, components, layout, motion, chips, cards, splash, The Peek and Pitch, or when the user types /ui-ux.
---

# Sweet Spot UI via UI/UX Pro Max

Entry point for the **UI/UX Pro Max** plugin in this repo. Do not invent a new brand. Do not switch the app to Tailwind, shadcn, or HTML.

Full plugin workflow: `.cursor/skills/ui-ux-pro-max/SKILL.md`

## Locked project facts

- App: Expo + React Native in `my-expo-app/`
- Product: poker-training mobile app, not a marketing site
- Canonical names: "The Peek and Pitch" (not "The Swipe"); tagging tray items are "Badges"
- Brand tokens: `my-expo-app/theme/brand.ts`
- Visual direction: `my-expo-app/theme/artStyle.ts` — 1930s rubber-hose cartoon, vintage casino, teal + gold, cream ink
- Plugin search script: `.cursor/skills/ui-ux-pro-max/scripts/search.py`
- On Windows run `python`, not `python3`

The plugin's `--design-system` output will invent palettes, fonts, and web patterns. Treat that as **inspiration only**. Keep existing hex tokens, assets, and RN components.

## Workflow

1. Read `my-expo-app/theme/brand.ts` and `my-expo-app/theme/artStyle.ts`.
2. Read the files being changed. Stay in React Native (`StyleSheet`, existing components). Do not add CSS frameworks.
3. Run plugin searches. Always include `--stack react-native` for implementation.
4. Apply spacing, hierarchy, touch targets, motion, and a11y from the plugin. Keep Sweet Spot colors, type, and art.
5. Before finishing UI work, run the checklist below.

## Search commands

From the repo root:

```bash
python .cursor/skills/ui-ux-pro-max/scripts/search.py "card board game poker vintage casino" --design-system -p "Sweet Spot" -f markdown
python .cursor/skills/ui-ux-pro-max/scripts/search.py "<concern>" --stack react-native
python .cursor/skills/ui-ux-pro-max/scripts/search.py "<concern>" --domain ux
python .cursor/skills/ui-ux-pro-max/scripts/search.py "accessibilityLabel touch safe-areas" --domain web
```

`--domain web` in this plugin is native-app interface guidance (touch, safe areas, Dynamic Type), not CSS.

### Query hints

| Task | Query |
|------|--------|
| New screen / visual direction | `"card board game poker vintage casino"` `--design-system` |
| Gesture / Peek and Pitch | `"gesture conflict tap drag"` `--domain ux` then `"pressable hit slop"` `--stack react-native` |
| Chips, badges, labels | `"badge chip label wraps"` `--domain ux` |
| Lists / performance | `"virtualized list"` `--stack react-native` |
| Motion | `"rapid chip animation interrupted"` `--domain ux` |
| Review existing UI | skip `--design-system`; use `ux` + `react-native` only |

Keep queries to 2–5 terms. Retry once if the result is off-topic. Do not persist plugin `MASTER.md` unless the user asks — it would overwrite the real brand.

## Do not

- Replace `brand.ts` / `artStyle.ts` with plugin hex values
- Use Tailwind, shadcn, Phosphor-for-web, `cursor-pointer`, or hover-only affordances
- Use emoji as icons
- Touch Bankroll, Gold Coins, Chips, or Elo systems while "designing"
- Rename The Peek and Pitch or Badges

## Pre-delivery checklist

- Touch targets ≥44pt; expand hit area when the glyph is smaller
- Pressed feedback (opacity/scale) without layout shift
- Safe areas respected; scroll content not hidden behind fixed bars
- Contrast ≥4.5:1 for body text on felt / night surfaces
- Reduced-motion path for non-essential animation
- Colors come from `brand.ts` / `artStyle.ts`, not new one-off hexes
- Copy uses canonical product names
