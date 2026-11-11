#!/usr/bin/env node
// Renders vox-scripts/<name>.json to out/<name>.mp4.
//   node scripts/vox-render.mjs <name> [extra remotion render flags, e.g. --frames=0-299]
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const [name, ...rest] = process.argv.slice(2);
if (!name) { console.error("Usage: npm run vox:render -- <name> [remotion flags]"); process.exit(1); }
const props = `vox-scripts/${name.replace(/\.json$/, "")}.json`;
if (!fs.existsSync(props)) { console.error(`Not found: ${props}. Run npm run vox:import first.`); process.exit(1); }
const out = `out/${name.replace(/\.json$/, "")}.mp4`;
const r = spawnSync("npx", ["remotion", "render", "VoxVideo", out, `--props=${props}`, ...rest], { stdio: "inherit" });
process.exit(r.status ?? 1);
