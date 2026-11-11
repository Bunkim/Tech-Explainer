#!/usr/bin/env node
// Converts a tech-explainer / vox-finance-explainer scene script (.txt or .json)
// into Remotion props at vox-scripts/<name>.json, then validates it.
//
//   node scripts/vox-import.mjs <script.txt|script.json> [--name my-video] [--no-captions]

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "vox-scripts");

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--name");
if (!input) {
  console.error("Usage: node scripts/vox-import.mjs <script.txt|script.json> [--name slug] [--no-captions]");
  process.exit(1);
}
const nameIdx = args.indexOf("--name");
const captions = !args.includes("--no-captions");

const raw = fs.readFileSync(input, "utf8");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";

// ---------- 1. Extract scenes ----------
/** Pulls every top-level JSON array out of the skill's .txt layout. */
function extractArrays(text) {
  const arrays = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf("[", i);
    if (start < 0) break;
    // Only consider arrays whose first non-space char is "{" (scene arrays).
    const after = text.slice(start + 1).trimStart();
    if (!after.startsWith("{")) { i = start + 1; continue; }
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let j = start; j < text.length; j++) {
      const c = text[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "[" || c === "{") depth++;
      else if (c === "]" || c === "}") { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end < 0) throw new Error(`Unclosed JSON array starting at character ${start}`);
    const chunk = text.slice(start, end + 1);
    try { arrays.push(JSON.parse(chunk)); }
    catch (e) { throw new Error(`Invalid JSON near "${chunk.slice(0, 80)}...": ${e.message}`); }
    i = end + 1;
  }
  return arrays;
}

let title;
let scenes;
const trimmed = raw.trim();
if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
  const parsed = JSON.parse(trimmed);
  scenes = Array.isArray(parsed) ? parsed : parsed.scenes;
  title = Array.isArray(parsed) ? undefined : parsed.title;
} else {
  scenes = extractArrays(raw).flat();
  title = raw.split("\n").map((l) => l.trim()).find(Boolean)?.replace(/^title:\s*/i, "");
}
if (!Array.isArray(scenes) || scenes.length === 0) {
  console.error("No scenes found. Expected JSON arrays of scene objects.");
  process.exit(1);
}
title = title || path.basename(input, path.extname(input));
const name = nameIdx >= 0 ? slugify(args[nameIdx + 1]) : slugify(title);

// ---------- 2. Normalise ----------
const DEFAULT_SFX = {
  voxTitle: () => [["pop", 0.15], ["whoosh", 0.4]],
  voxCutout: (d) => [["whoosh", 0], ...(d?.stat ? [["pop", 0.85]] : [])],
  voxChart: (d) => [["whoosh", 0], ...(d?.mode === "bar" ? (d.items ?? []).slice(0, 3).map((_, i) => ["pop", [0.7, 1.0, 1.35][i]]) : [])],
  voxBigNumber: () => [["impact", 0, 0.5], ["pop", 1.35]],
  voxBubbles: (d) => [["whoosh", 0], ...(d?.items ?? []).slice(0, 4).map((_, i) => ["pop", [0.85, 1.5, 2.15, 2.85][i]])],
  voxNote: () => [["whoosh", 0], ["pop", 1.2]],
};

const sfxPath = (f) => {
  let p = String(f).replace(/^\/+/, "").replace(/^public\//, "");
  if (!p.includes("/")) p = `sfx/${p}`;
  if (!path.extname(p)) p += ".wav";
  return p;
};

function normaliseSfx(scene) {
  let cues = scene.sfx;
  if (!Array.isArray(cues) || cues.length === 0) {
    cues = (DEFAULT_SFX[scene.scene]?.(scene.data) ?? []).map(([file, at, volume]) => ({ file, at, volume }));
  }
  return cues
    .map((c) => {
      if (typeof c === "string") return { file: sfxPath(c), at: 0 };
      if (Array.isArray(c)) return { file: sfxPath(c[0]), at: Number(c[1] ?? 0), ...(c[2] != null ? { volume: Number(c[2]) } : {}) };
      const file = c.file ?? c.name ?? c.sfx ?? c.sound ?? c.src;
      const at = Number(c.at ?? c.time ?? c.t ?? c.start ?? c.offset ?? 0);
      const volume = c.volume ?? c.vol;
      return file ? { file: sfxPath(file), at, ...(volume != null ? { volume: Number(volume) } : {}) } : null;
    })
    .filter(Boolean);
}

const warnings = [];
const errors = [];
const exists = (rel) => fs.existsSync(path.join(PUBLIC, rel));
const missingSfx = new Set();

const out = scenes.map((s, i) => {
  const id = s.id || `vox-${String(i + 1).padStart(3, "0")}`;
  const scene = { id, scene: s.scene, narration: String(s.narration ?? "").trim(), data: s.data ?? {} };
  scene.sfx = normaliseSfx(s).filter((c) => {
    if (exists(c.file)) return true;
    missingSfx.add(c.file);
    return false;
  });
  for (const key of ["image", "voiceover"]) {
    if (!s[key]) continue;
    const rel = String(s[key]).replace(/^\/+/, "").replace(/^public\//, "");
    if (exists(rel)) scene[key] = rel;
    else warnings.push(`${id}: ${key} "${rel}" not found in public/ - dropped so the render doesn't break`);
  }
  if (s.durationInSeconds) scene.durationInSeconds = Number(s.durationInSeconds);
  if (s.source) scene.source = s.source;
  if (s.imageIdea) scene.imageIdea = s.imageIdea;
  return scene;
});
if (missingSfx.size) warnings.push(`SFX not found in public/ (skipped): ${[...missingSfx].join(", ")} - run "npm run vox:sfx" to generate defaults`);

// ---------- 3. Validate (limits from the skill) ----------
const TEMPLATES = ["voxTitle", "voxCutout", "voxChart", "voxBigNumber", "voxBubbles", "voxNote"];
const len = (v) => String(v ?? "").length;
const limit = (id, field, v, max) => { if (len(v) > max) warnings.push(`${id}: ${field} is ${len(v)} chars (max ${max}): "${v}"`); };
const ids = new Set();
let totalWords = 0;

out.forEach((s, i) => {
  const { id, data: d } = s;
  if (ids.has(id)) errors.push(`${id}: duplicate id`);
  ids.add(id);
  if (!TEMPLATES.includes(s.scene)) { errors.push(`${id}: unknown scene template "${s.scene}"`); return; }
  const words = s.narration.split(/\s+/).filter(Boolean).length;
  totalWords += words;
  if (words < 12 || words > 30) warnings.push(`${id}: narration has ${words} words (target 12-30)`);
  if (i >= 2 && out[i - 1].scene === s.scene && out[i - 2].scene === s.scene) warnings.push(`${id}: third ${s.scene} in a row`);

  switch (s.scene) {
    case "voxTitle":
      if (!d.title) errors.push(`${id}: voxTitle needs data.title`);
      limit(id, "kicker", d.kicker, 20); limit(id, "title", d.title, 30);
      if (d.highlight && !String(d.title).includes(d.highlight)) warnings.push(`${id}: highlight "${d.highlight}" not in title`);
      break;
    case "voxCutout":
      if (d.stat) { limit(id, "stat.value", d.stat.value, 7); limit(id, "stat.label", d.stat.label, 18); }
      break;
    case "voxChart":
      limit(id, "title", d.title, 32); limit(id, "unit", d.unit, 24);
      if (d.mode === "bar") {
        if (!Array.isArray(d.items) || d.items.length < 2 || d.items.length > 3) errors.push(`${id}: bar chart needs 2-3 items`);
        else d.items.forEach((it) => { if (typeof it.value !== "number") errors.push(`${id}: bar value for "${it.label}" must be a number`); else if (it.value <= 0) warnings.push(`${id}: bar "${it.label}" is zero/negative`); });
      } else if (d.mode === "line") {
        if (!Array.isArray(d.labels) || !Array.isArray(d.series) || d.series.length === 0) errors.push(`${id}: line chart needs labels and series`);
        else d.series.forEach((sr) => { if (sr.values?.length !== d.labels.length) errors.push(`${id}: series "${sr.name}" has ${sr.values?.length} values but ${d.labels.length} labels`); });
      } else errors.push(`${id}: voxChart mode must be "bar" or "line"`);
      break;
    case "voxBigNumber":
      if (typeof d.value !== "number") errors.push(`${id}: voxBigNumber value must be a plain number`);
      limit(id, "prefix", d.prefix, 2); limit(id, "suffix", d.suffix, 4); limit(id, "label", d.label, 28);
      break;
    case "voxBubbles":
      if (!Array.isArray(d.items) || d.items.length < 2 || d.items.length > 4) errors.push(`${id}: voxBubbles needs 2-4 items`);
      else d.items.forEach((t) => limit(id, "bubble", t, 14));
      break;
    case "voxNote":
      if (!d.text) errors.push(`${id}: voxNote needs data.text`);
      limit(id, "kicker", d.kicker, 16); limit(id, "text", d.text, 90);
      if (d.highlight && !String(d.text).includes(d.highlight)) warnings.push(`${id}: highlight "${d.highlight}" not in text`);
      break;
  }
});

// ---------- 4. Write ----------
fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `${name}.json`);
const seconds = out.reduce((sum, s) => {
  const w = s.narration.split(/\s+/).filter(Boolean).length;
  return sum + (s.durationInSeconds ?? Math.max(3, (w / 140) * 60 + 0.6));
}, 0);

if (errors.length) {
  console.error(`\n✖ ${errors.length} error(s) - fix these in the script and re-run:`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
fs.writeFileSync(outFile, JSON.stringify({ title, captions, scenes: out }, null, 2) + "\n");
console.log(`✔ ${out.length} scenes, ${totalWords} words, ~${Math.floor(seconds / 60)}m${String(Math.round(seconds % 60)).padStart(2, "0")}s`);
console.log(`✔ wrote ${path.relative(ROOT, outFile)}`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log("  - " + w));
}
console.log(`\nPreview: npm run dev  (pick VoxVideo, then load props from ${path.relative(ROOT, outFile)})`);
console.log(`Render:  npm run vox:render -- ${name}`);
