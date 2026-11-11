# Dark-UI Tech Templates — Spec v1

Spec for building the `tech*` templates in your motion-graphics engine. The script `The_6.3_Billion_Job_Interview.txt` uses exactly these names, fields and limits. Look: near-black background, neon-green accent with glow, white secondary text, rounded dark cards with thin borders, mono font for terminals and labels.

## Scene object

```json
{ "id": "tech-001-slug", "scene": "<template>", "narration": "...", "data": {...},
  "hud": { "step": 1, "status": "INCIDENT DETECTED" }, "sfx": [...], "source": "...", "imageIdea": "..." }
```

- Scene length follows the narration audio. Card elements should animate in over the first ~2 s, then hold with subtle motion (glow pulse, ticker scroll).
- `source` and `imageIdea` are creator notes. The engine ignores them.

## Global frame (`videoConfig`, once per video)

| Field | Type | Notes |
|---|---|---|
| theme | string | `darkNeon` |
| ticker | string[] 4–10 | **Not rendered** (removed by request). Accepted and ignored by the importer. |
| steps | string[] 3–8, each ≤10 UPPERCASE | Progress bar. Steps before `hud.step` show ✓, the current step glows. |
| footer | string ≤50 | Small text at the bottom of every scene. |

Per-scene `hud`: `step` (1-based index into `steps`), optional `status` (≤24 UPPERCASE, shown as a "● STATUS" chip).

## Templates

### 1. techHeadline
Small white line plus a huge neon word, entering and exiting with a glitch/RGB split (sample 1).
- `kicker` ≤20 UPPERCASE (for example "CHAPTER 3", "SUBSCRIBE", "ONE LAST THING")
- `top` ≤22: white line
- `main` ≤16: neon line with glow

### 2. techChat
A chat or mail window. Lines type in one by one (samples 1, 3, 4).
- `window` ≤18: window title
- `sender` ≤20 (can be empty)
- `lines` 1–4, each ≤52
- `typing` bool: true = the last line types with a cursor

### 3. techChecklist
Items light up in sequence, with an optional stamp at the end (samples 1, 8).
- `title` ≤24 UPPERCASE
- `items` 3–6, each ≤28
- `state` `progress` (last item spinner) | `done` (all green ✓) | `fail` (items turn red ✕)
- `stamp` ≤10 UPPERCASE, optional: rotated stamp after the last item

### 4. techStatGrid
2–4 tiles, each with a value and sparkline (samples 1, 7).
- `tiles` 2–4: `{label ≤16 UPPERCASE, value ≤8, trend "up"|"down"|"flat"}`
- Value can be text ("~3.5 min"). Numbers count up where they parse as numbers.

### 5. techBigStat
One huge counting number, with optional points that light up below (samples 7, 8).
- `value` number (counts up), `prefix` ≤2, `suffix` ≤4
- `label` ≤28 UPPERCASE, `sub` ≤44
- `points` 0–4, each ≤20 UPPERCASE

### 6. techBarRank
Horizontal bars that grow in, with one row highlighted neon and the rest gray (sample 1).
- `title` ≤32, `unit` ≤16
- `items` 2–5: `{label ≤14, value > 0, highlight?}`

### 7. techVersus
Two columns, good vs bad (sample 1 bull/bear).
- `left` / `right`: `{title ≤18 UPPERCASE, items 2–3, each ≤26}`
- `leftTone` `good` (left green, right red) | `bad` (reversed)

### 8. techFeed
Alert or news cards stacking in (sample 1).
- `title` ≤20 UPPERCASE
- `items` 2–4: `{tag ≤14 UPPERCASE, text ≤40}`

### 9. techSourceCheck
A claim card, then a source card, then a verdict badge (sample 1 "NUMBER MATCHES").
- `claim` ≤100, `highlight` = exact substring of the claim (underlined or marked)
- `source` ≤32, `detail` ≤40
- `verdict` ≤16 UPPERCASE (CONFIRMED / DISPUTED / REPORTED…). Suggested colors: green for CONFIRMED, amber otherwise.

### 10. techTimeline
Nodes on a line, filling up to `active` (sample 1 Q1–Q4).
- `title` ≤24
- `nodes` 3–6: `{label ≤10, sub ≤14}`
- `active` index: nodes up to here are lit, and the active one pulses

### 11. techHub
A center node with connected nodes (sample 4 hub, sample 6 orbit).
- `center` ≤16
- `nodes` 3–6, each ≤14
- `mode` `hub` (dashed connectors) | `orbit` (rings with particles)
- `flow` `out` | `in`: direction of the travelling dots on the lines

### 12. techTerminal
A mono terminal window with lines typing out. The last line flashes (new; fits the hacker theme).
- `title` ≤20 (window name)
- `lines` 2–6, each ≤44

### 13. techPhone
A 3D-tilted phone rising in, showing an app screen (sample 9).
- `app` ≤16, `screenTitle` ≤20, `value` ≤12 (big value on screen)
- `rows` 1–3, each ≤30
- `banner` ≤30: alert banner sliding down

## Default SFX (the script already includes these)

| Template | SFX |
|---|---|
| techHeadline | whoosh 0, impact 0.35 (vol 0.4) |
| techChat | whoosh 0, typewriter 0.3 |
| techChecklist | whoosh 0, pin per item from 0.6 every 0.4; stamp after the last item |
| techStatGrid | whoosh 0, pop per tile from 0.5 every 0.3 |
| techBigStat | impact 0 (vol 0.5), pop 1.2 |
| techBarRank | whoosh 0, pop per bar from 0.7 every 0.3 |
| techVersus | whoosh 0, pop 0.6, pop 1.0 |
| techFeed | whoosh 0, pin per item from 0.5 every 0.4 |
| techSourceCheck | whoosh 0, typewriter 0.3, stamp 1.6 |
| techTimeline | whoosh 0, pin per node from 0.5 every 0.35 |
| techHub | whoosh 0, pop per node from 0.6 every 0.25 |
| techTerminal | typewriter 0 |
| techPhone | whoosh 0, pop 1.0 |

Files: sfx/pop.wav, sfx/whoosh.wav, sfx/impact.wav, sfx/typewriter.wav, sfx/stamp.wav, sfx/pin.wav. A glitch sound for techHeadline would be a nice addition later.

## Pacing rules the script follows
- Never the same template 3 times in a row.
- Every chapter has at least one techBigStat, techBarRank or techStatGrid.
- Narration is 12–30 words per scene, and the total is at least 2,100 words.
