# Tech-Explainer

Explainer videos built with [Remotion](https://remotion.dev).

## Commands

- `npm install` – install dependencies
- `npm run dev` – open Remotion Studio
- `npm run lint` – type-check

## Vox scene scripts → video

Renders the JSON scene scripts produced by the `tech-explainer` skill
(templates: voxTitle, voxCutout, voxChart, voxBigNumber, voxBubbles, voxNote).

```bash
npm run vox:sfx                                                   # once: generate default sound effects
npm run vox:import -- vox-scripts/source/my-video.txt --name my-video  # convert + validate
npm run vox:render -- my-video                                    # -> out/my-video.mp4
```

Put cut-out PNGs in `public/cutouts/` and voiceover files in `public/voiceover/`.
In Claude Code, the `/vox-to-remotion` skill (`.claude/skills/vox-to-remotion/SKILL.md`)
runs this pipeline for you.
