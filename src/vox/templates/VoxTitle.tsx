import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, fadeUp, pop } from "../anim";
import { Highlighted } from "../Highlight";
import { theme } from "../theme";
import type { VoxTitleData } from "../types";
import { Kicker, Paper } from "./Paper";

export const VoxTitle: React.FC<{ data: VoxTitleData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = pop(frame, fps, 0.1);
  const t = ease(frame, fps, 0.35);
  const rule = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Paper>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 180px" }}>
        <div style={{ ...fadeUp(k), display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 120 * rule, height: 8, background: theme.orange }} />
          <Kicker text={data.kicker} />
        </div>
        <div
          style={{
            ...fadeUp(t),
            marginTop: 36,
            fontFamily: theme.serif,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
          }}
        >
          <Highlighted text={data.title} highlight={data.highlight} delaySeconds={0.8} />
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
