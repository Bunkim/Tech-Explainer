import { AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop } from "../anim";
import { theme } from "../theme";
import type { VoxBigNumberData } from "../types";
import { Paper } from "./Paper";

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

export const VoxBigNumber: React.FC<{ data: VoxBigNumberData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Counts up over 1.3 s, landing with the pop SFX at 1.35 s.
  const progress = interpolate(frame, [0, 1.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const d = decimals(data.value);
  const shown = (data.value * progress).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  const landed = pop(frame, fps, 1.3);
  const scale = 1 + 0.06 * Math.sin(Math.min(1, landed) * Math.PI);

  return (
    <Paper tint={theme.ink}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: theme.paper }}>
        <div
          style={{
            fontFamily: theme.serif,
            fontWeight: 800,
            fontSize: 300,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${scale})`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: theme.orange }}>{data.prefix}</span>
          {shown}
          <span style={{ color: theme.orange }}>{data.suffix}</span>
        </div>
        <div
          style={{
            ...fadeUp(landed),
            marginTop: 40,
            fontFamily: theme.mono,
            fontWeight: 700,
            fontSize: 50,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: theme.lilac,
          }}
        >
          {data.label}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
