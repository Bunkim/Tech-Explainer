import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../anim";
import { theme } from "../theme";
import type { VoxBubblesData } from "../types";
import { Paper } from "./Paper";

// Bubble pops match the default SFX (0.85, 1.5, 2.15, 2.85 s).
const DELAYS = [0.85, 1.5, 2.15, 2.85];
const COLORS = [theme.orange, theme.lilac, theme.ink, theme.lilacSoft];
const TEXT = [theme.paper, theme.ink, theme.paper, theme.ink];

export const VoxBubbles: React.FC<{ data: VoxBubblesData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = data.items.length;
  const size = n <= 2 ? 520 : n === 3 ? 440 : 380;

  return (
    <Paper>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 40 }}>
        {data.items.map((item, i) => {
          const s = pop(frame, fps, DELAYS[i] ?? 0.85 + i * 0.65);
          return (
            <div
              key={item + i}
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: COLORS[i % COLORS.length],
                color: TEXT[i % TEXT.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 40,
                fontFamily: theme.sans,
                fontWeight: 800,
                // Shrink long words so they stay inside the circle.
                fontSize: Math.min(size / 7.5, (size - 90) / (item.length * 0.68)),
                letterSpacing: "0.02em",
                transform: `scale(${s}) translateY(${i % 2 ? 50 : -50}px)`,
                boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
              }}
            >
              {item}
            </div>
          );
        })}
      </AbsoluteFill>
    </Paper>
  );
};
