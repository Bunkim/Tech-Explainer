---
name: vox-to-remotion
description: Turn a tech-explainer / vox-finance-explainer JSON scene script (.txt or .json) into a rendered Remotion video. Use when the user wants to import, validate, preview or render a Vox scene script, add cut-out images or voiceover to it, or change how a vox template (voxTitle, voxCutout, voxChart, voxBigNumber, voxBubbles, voxNote) looks.
---

# Vox script → Remotion video

This repo has a Remotion engine (`src/vox/`) that renders the scene scripts written by the
`tech-explainer` / `vox-finance-explainer` skills. One scene object = one timed sequence.

## Pipeline

1. **Get the script.** Save the skill's .txt deliverable (title line, chapter headers, JSON
   arrays, "FACT-CHECK" footer) or a plain JSON array / `{title, scenes}` object to
   `vox-scripts/source/<name>.txt`. If the user pastes it, write it there verbatim.
2. **Import + validate:**
   `npm run vox:import -- vox-scripts/source/<name>.txt --name <slug>`
   - Writes `vox-scripts/<slug>.json` (the Remotion props).
   - Fills default SFX per template when a scene has none; drops sfx/image/voiceover files
     missing from `public/` (missing files break renders) and lists them as warnings.
   - Errors (exit 1) on broken structure: unknown template, bar charts without 2–3 numeric
     items, line series length ≠ labels, bubbles outside 2–4, duplicate ids, non-numeric big number.
   - Warns on the skill's soft limits (12–30 words, character limits, highlight not found,
     3 same templates in a row). Report warnings to the user; fix errors in the source and re-run.
   - `--no-captions` turns off the burned-in narration captions.
3. **SFX:** if warned that SFX are missing, run `npm run vox:sfx` (synthesises pop, whoosh,
   impact, typewriter, stamp, pin into `public/sfx/`; never overwrites existing files without `--force`).
4. **Check:** `npx tsc` must pass. For a quick visual check render stills:
   `npx remotion still VoxVideo out/check.png --props=vox-scripts/<slug>.json --frame=<n> --scale=0.5`
   and look at them before a full render.
5. **Render:** `npm run vox:render -- <slug>` → `out/<slug>.mp4`.
   Extra Remotion flags pass through, e.g. `--frames=0-299` for a test segment.
   In a cloud session without a system Chrome, add `--browser-executable=/opt/pw-browsers/chromium`.
6. **Preview:** `npm run dev` opens Remotion Studio; pick `VoxVideo`. Its default props come
   from `vox-scripts/sample.json` — to preview another script, temporarily point the import in
   `src/Root.tsx` at it, or paste its JSON into the Studio props editor.

## Timing

Each scene lasts `words / 140 wpm + 0.6 s` (minimum 3 s) at 30 fps, matching the skill's
140 wpm estimate (`src/vox/timing.ts`). Set `"durationInSeconds"` on a scene to override —
do this once real voiceover exists so visuals follow the audio.

## Optional per-scene fields (beyond the skill's format)

- `"image": "cutouts/<file>.png"` – cut-out PNG in `public/cutouts/` (voxCutout shows it;
  without one it typewrites the narration instead).
- `"voiceover": "voiceover/<file>.mp3"` – audio in `public/voiceover/`, played at scene start.
- `"durationInSeconds": 7.4` – exact scene length.
- `sfx` accepts `{"file":"pop","at":0.15,"volume":0.5}`, `["pop",0.15]`, or `"pop"`; bare names
  resolve to `sfx/<name>.wav`.

## Templates (src/vox/templates/)

| scene | data | look |
|---|---|---|
| voxTitle | kicker, title, highlight | serif headline, orange marker sweep on highlight |
| voxCutout | stat? {value, label, icon} | lilac split panel, image or typewriter, orange stat card |
| voxChart | bar: title, unit, items · line: title, unit, labels, series | bars pop at 0.7/1.0/1.35 s; lines draw in |
| voxBigNumber | value, prefix, suffix, label | dark slide, counts up, lands at 1.3 s |
| voxBubbles | items (2–4) | circles pop at 0.85/1.5/2.15/2.85 s |
| voxNote | kicker, text, highlight | card, typewriter text, then highlight |

Animation beats are aligned with the skill's default SFX timings — keep them in sync if you
change either. Palette and fonts live in `src/vox/theme.ts` (off-white, orange, lilac;
Fraunces / Inter / Space Mono via `@remotion/google-fonts`).

## Adding a template (e.g. voxStatCards, voxWordRoll, voxReport)

1. Add its data type and union member in `src/vox/types.ts`.
2. Create `src/vox/templates/<Name>.tsx` using `Paper`/`Kicker` and helpers in `anim.ts`.
3. Add a case in `SceneBody` in `src/vox/VoxVideo.tsx`.
4. Add default SFX + validation rules in `scripts/vox-import.mjs`.
5. Add a scene to `vox-scripts/source/sample.txt`, re-import, `npx tsc`, render a still.
6. Tell the user to add the template and its limits to their tech-explainer skill so new
   scripts use it.
