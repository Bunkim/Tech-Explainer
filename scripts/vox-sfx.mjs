#!/usr/bin/env node
// Synthesises the default SFX the skill expects into public/sfx/*.wav.
// Existing files are kept, so you can drop in your own sounds and re-run safely.
//   node scripts/vox-sfx.mjs [--force]
import fs from "node:fs";
import path from "node:path";

const RATE = 44100;
const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public/sfx");
const force = process.argv.includes("--force");
fs.mkdirSync(dir, { recursive: true });

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function render(seconds, fn) {
  const n = Math.round(seconds * RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / RATE, i);
  return out;
}

function lowpass(samples, cutoff) {
  const rc = 1 / (2 * Math.PI * cutoff), dt = 1 / RATE, a = dt / (rc + dt);
  let y = 0;
  return samples.map((x) => (y += a * (x - y)));
}

const sounds = {
  pop: () => render(0.12, (t) => Math.sin(2 * Math.PI * (900 - 3000 * t) * t) * Math.exp(-t * 40)),
  whoosh: () => {
    const len = 0.5;
    const noise = render(len, () => rand());
    return lowpass(noise, 1800).map((x, i) => {
      const t = i / RATE;
      return x * 2.2 * Math.sin((Math.PI * t) / len) ** 2;
    });
  },
  impact: () =>
    render(0.7, (t) => Math.sin(2 * Math.PI * (70 - 30 * t) * t) * Math.exp(-t * 6) + rand() * 0.3 * Math.exp(-t * 30)),
  typewriter: () => render(0.05, (t) => (rand() * 0.8 + Math.sin(2 * Math.PI * 2500 * t) * 0.4) * Math.exp(-t * 120)),
  stamp: () => render(0.3, (t) => (Math.sin(2 * Math.PI * 120 * t) + rand() * 0.6) * Math.exp(-t * 18)),
  pin: () => render(0.6, (t) => (Math.sin(2 * Math.PI * 1760 * t) + 0.4 * Math.sin(2 * Math.PI * 2640 * t)) * Math.exp(-t * 7) * 0.6),
};

function toWav(samples) {
  const peak = Math.max(...samples.map(Math.abs)) || 1;
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round((s / peak) * 0.8 * 32767), 44 + i * 2));
  return buf;
}

for (const [name, make] of Object.entries(sounds)) {
  const file = path.join(dir, `${name}.wav`);
  if (fs.existsSync(file) && !force) { console.log(`- kept   sfx/${name}.wav`); continue; }
  fs.writeFileSync(file, toWav(make()));
  console.log(`✔ wrote  sfx/${name}.wav`);
}
