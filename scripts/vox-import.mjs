#!/usr/bin/env node
// Converts a scene script (.txt or .json) into Remotion props at vox-scripts/<name>.json,
// then validates it. Handles both formats:
//   - vox*  templates (light editorial)  -> VoxVideo composition
//   - tech* templates (dark neon + videoConfig) -> TechVideo composition
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

/** Finds the object that contains "videoConfig" (tech format) and returns its value. */
function extractVideoConfig(text) {
  const key = text.indexOf('"videoConfig"');
  if (key < 0) return undefined;
  const start = text.lastIndexOf("{", key);
  let depth = 0, inStr = false, esc = false;
  for (let j = start; j < text.length; j++) {
    const c = text[j];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") { depth--; if (depth === 0) return JSON.parse(text.slice(start, j + 1)).videoConfig; }
  }
  return undefined;
}

let title;
let scenes;
let videoConfig = extractVideoConfig(raw);
const trimmed = raw.trim();
if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
  const parsed = JSON.parse(trimmed);
  scenes = Array.isArray(parsed) ? parsed : parsed.scenes;
  title = Array.isArray(parsed) ? undefined : parsed.title;
  videoConfig = videoConfig ?? (Array.isArray(parsed) ? undefined : parsed.config ?? parsed.videoConfig);
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
  // tech* defaults (docs/tech-templates-spec.md)
  techHeadline: () => [["whoosh", 0], ["impact", 0.35, 0.4]],
  techChat: () => [["whoosh", 0], ["typewriter", 0.3]],
  techChecklist: (d) => {
    const n = (d?.items ?? []).length;
    return [["whoosh", 0], ...Array.from({ length: n }, (_, i) => ["pin", 0.6 + i * 0.4]), ...(d?.stamp ? [["stamp", 0.6 + n * 0.4 + 0.1]] : [])];
  },
  techStatGrid: (d) => [["whoosh", 0], ...(d?.tiles ?? []).map((_, i) => ["pop", 0.5 + i * 0.3])],
  techBigStat: () => [["impact", 0, 0.5], ["pop", 1.2]],
  techBarRank: (d) => [["whoosh", 0], ...(d?.items ?? []).map((_, i) => ["pop", 0.7 + i * 0.3])],
  techVersus: () => [["whoosh", 0], ["pop", 0.6], ["pop", 1.0]],
  techFeed: (d) => [["whoosh", 0], ...(d?.items ?? []).map((_, i) => ["pin", 0.5 + i * 0.4])],
  techSourceCheck: () => [["whoosh", 0], ["typewriter", 0.3], ["stamp", 1.6]],
  techTimeline: (d) => [["whoosh", 0], ...(d?.nodes ?? []).map((_, i) => ["pin", 0.5 + i * 0.35])],
  techHub: (d) => [["whoosh", 0], ...(d?.nodes ?? []).map((_, i) => ["pop", 0.6 + i * 0.25])],
  techTerminal: () => [["typewriter", 0]],
  techPhone: () => [["whoosh", 0], ["pop", 1.0]],
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
  if (s.hud) scene.hud = s.hud;
  if (s.durationInSeconds) scene.durationInSeconds = Number(s.durationInSeconds);
  if (s.source) scene.source = s.source;
  if (s.imageIdea) scene.imageIdea = s.imageIdea;
  return scene;
});
if (missingSfx.size) warnings.push(`SFX not found in public/ (skipped): ${[...missingSfx].join(", ")} - run "npm run vox:sfx" to generate defaults`);

// ---------- 3. Validate (limits from the skill) ----------
const len = (v) => String(v ?? "").length;
const limit = (id, field, v, max) => { if (len(v) > max) warnings.push(`${id}: ${field} is ${len(v)} chars (max ${max}): "${v}"`); };
const VOX = ["voxTitle", "voxCutout", "voxChart", "voxBigNumber", "voxBubbles", "voxNote"];
const TECH = ["techHeadline", "techChat", "techChecklist", "techStatGrid", "techBigStat", "techBarRank", "techVersus",
  "techFeed", "techSourceCheck", "techTimeline", "techHub", "techTerminal", "techPhone"];
const format = out.some((s) => String(s.scene).startsWith("tech")) ? "tech" : "vox";
const TEMPLATES = format === "tech" ? TECH : VOX;
const count = (id, field, arr, min, max) => {
  if (!Array.isArray(arr) || arr.length < min || arr.length > max) { errors.push(`${id}: ${field} needs ${min}-${max} entries (has ${Array.isArray(arr) ? arr.length : "none"})`); return false; }
  return true;
};
if (format === "tech") {
  if (!videoConfig?.steps?.length) warnings.push("No videoConfig.steps found - the step bar will be empty");
  else {
    if (videoConfig.steps.length < 3 || videoConfig.steps.length > 8) warnings.push(`videoConfig.steps has ${videoConfig.steps.length} entries (spec 3-8)`);
    videoConfig.steps.forEach((st) => limit("videoConfig", "step", st, 10));
  }
  limit("videoConfig", "footer", videoConfig?.footer, 50);
}
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
    // ---- tech* (limits from docs/tech-templates-spec.md) ----
    case "techHeadline":
      if (!d.main) errors.push(`${id}: techHeadline needs data.main`);
      limit(id, "kicker", d.kicker, 20); limit(id, "top", d.top, 22); limit(id, "main", d.main, 16);
      break;
    case "techChat":
      limit(id, "window", d.window, 18); limit(id, "sender", d.sender, 20);
      if (count(id, "lines", d.lines, 1, 4)) d.lines.forEach((l) => limit(id, "line", l, 52));
      break;
    case "techChecklist":
      limit(id, "title", d.title, 24); limit(id, "stamp", d.stamp, 10);
      if (!["progress", "done", "fail"].includes(d.state)) errors.push(`${id}: state must be progress|done|fail`);
      if (count(id, "items", d.items, 3, 6)) d.items.forEach((t) => limit(id, "item", t, 28));
      break;
    case "techStatGrid":
      if (count(id, "tiles", d.tiles, 2, 4)) d.tiles.forEach((t) => { limit(id, "tile.label", t.label, 16); limit(id, "tile.value", t.value, 8); });
      break;
    case "techBigStat":
      if (typeof d.value !== "number") errors.push(`${id}: techBigStat value must be a number`);
      limit(id, "prefix", d.prefix, 2); limit(id, "suffix", d.suffix, 4); limit(id, "label", d.label, 28); limit(id, "sub", d.sub, 44);
      if (d.points && count(id, "points", d.points, 0, 4)) d.points.forEach((p) => limit(id, "point", p, 20));
      break;
    case "techBarRank":
      limit(id, "title", d.title, 32); limit(id, "unit", d.unit, 16);
      if (count(id, "items", d.items, 2, 5)) d.items.forEach((it) => {
        limit(id, "label", it.label, 14);
        if (typeof it.value !== "number" || it.value <= 0) errors.push(`${id}: bar "${it.label}" needs a value > 0`);
      });
      break;
    case "techVersus":
      for (const side of ["left", "right"]) {
        if (!d[side]) { errors.push(`${id}: techVersus needs data.${side}`); continue; }
        limit(id, `${side}.title`, d[side].title, 18);
        if (count(id, `${side}.items`, d[side].items, 2, 3)) d[side].items.forEach((t) => limit(id, `${side} item`, t, 26));
      }
      break;
    case "techFeed":
      limit(id, "title", d.title, 20);
      if (count(id, "items", d.items, 2, 4)) d.items.forEach((it) => { limit(id, "tag", it.tag, 14); limit(id, "text", it.text, 40); });
      break;
    case "techSourceCheck":
      limit(id, "claim", d.claim, 100); limit(id, "source", d.source, 32); limit(id, "detail", d.detail, 40); limit(id, "verdict", d.verdict, 16);
      if (d.highlight && !String(d.claim).includes(d.highlight)) warnings.push(`${id}: highlight "${d.highlight}" not in claim`);
      break;
    case "techTimeline":
      limit(id, "title", d.title, 24);
      if (count(id, "nodes", d.nodes, 3, 6)) {
        d.nodes.forEach((n) => { limit(id, "node.label", n.label, 10); limit(id, "node.sub", n.sub, 14); });
        if (!(d.active >= 0 && d.active < d.nodes.length)) errors.push(`${id}: active must be 0-${d.nodes.length - 1}`);
      }
      break;
    case "techHub":
      limit(id, "center", d.center, 16);
      if (count(id, "nodes", d.nodes, 3, 6)) d.nodes.forEach((n) => limit(id, "node", n, 14));
      break;
    case "techTerminal":
      limit(id, "title", d.title, 20);
      if (count(id, "lines", d.lines, 2, 6)) d.lines.forEach((l) => limit(id, "line", l, 44));
      break;
    case "techPhone":
      limit(id, "app", d.app, 16); limit(id, "screenTitle", d.screenTitle, 20); limit(id, "value", d.value, 12); limit(id, "banner", d.banner, 30);
      if (count(id, "rows", d.rows, 1, 3)) d.rows.forEach((r) => limit(id, "row", r, 30));
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
const props = { title, captions, scenes: out };
if (format === "tech") {
  // The ticker is intentionally not rendered, so it is not carried over.
  props.config = { theme: videoConfig?.theme ?? "darkNeon", steps: videoConfig?.steps ?? [], footer: videoConfig?.footer };
}
fs.writeFileSync(outFile, JSON.stringify(props, null, 2) + "\n");
console.log(`✔ ${out.length} scenes, ${totalWords} words, ~${Math.floor(seconds / 60)}m${String(Math.round(seconds % 60)).padStart(2, "0")}s`);
console.log(`✔ wrote ${path.relative(ROOT, outFile)} (${format === "tech" ? "TechVideo" : "VoxVideo"} composition)`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log("  - " + w));
}
console.log(`\nPreview: npm run dev  (pick ${format === "tech" ? "TechVideo" : "VoxVideo"}, then load props from ${path.relative(ROOT, outFile)})`);
console.log(`Render:  npm run vox:render -- ${name}`);
