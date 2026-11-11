import { random } from "remotion";
import type { Trend } from "../types";

export const Sparkline: React.FC<{ trend: Trend; color: string; seed: string; progress: number; w?: number; h?: number }> = ({
  trend,
  color,
  seed,
  progress,
  w = 300,
  h = 70,
}) => {
  const N = 14;
  const slope = trend === "up" ? 1 : trend === "down" ? -1 : 0;
  const pts = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const base = 0.5 - slope * (t - 0.5) * 0.7;
    const y = base + (random(`${seed}-${i}`) - 0.5) * 0.25;
    return [t * w, Math.min(h - 4, Math.max(4, y * h))];
  });
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h}>
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, progress))}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </svg>
  );
};
