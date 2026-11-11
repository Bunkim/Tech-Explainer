import { interpolate, spring } from "remotion";

export const enter = (frame: number, fps: number, at = 0) =>
  spring({ frame: frame - at * fps, fps, config: { damping: 16, stiffness: 170 } });

export const slideIn = (p: number, dy = 30): React.CSSProperties => ({
  opacity: Math.min(1, Math.max(0, p)),
  transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px)`,
});

export const typedChars = (frame: number, fps: number, text: string, at = 0, cps = 45) =>
  Math.max(0, Math.min(text.length, Math.floor(((frame - at * fps) / fps) * cps)));

/** Slow sine pulse in [0,1] for "hold with subtle motion". */
export const pulse = (frame: number, fps: number, period = 1.6) =>
  0.5 + 0.5 * Math.sin((frame / fps / period) * Math.PI * 2);

/** Parses "$6.3B", "~20 min", "57" into a number to count up, keeping the surrounding text. */
export const splitNumber = (value: string) => {
  const m = value.match(/^(\D*?)(\d[\d,]*\.?\d*)(.*)$/);
  if (!m) return null;
  const num = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return { pre: m[1], num, post: m[3], decimals: (m[2].split(".")[1] ?? "").length, commas: m[2].includes(",") };
};

export const fmtNum = (n: number, decimals: number, commas = true) =>
  commas
    ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : n.toFixed(decimals);
