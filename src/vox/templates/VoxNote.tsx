import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, fadeUp, typed } from "../anim";
import { Highlighted } from "../Highlight";
import { theme } from "../theme";
import type { VoxNoteData } from "../types";
import { Kicker, Paper } from "./Paper";

export const VoxNote: React.FC<{ data: VoxNoteData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = ease(frame, fps, 0);
  const chars = typed(frame, fps, data.text, 60, 0.2);
  const done = chars >= data.text.length;

  return (
    <Paper>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            ...fadeUp(card),
            width: 1400,
            background: "#FFFDF8",
            borderLeft: `16px solid ${theme.orange}`,
            borderRadius: 12,
            padding: "70px 90px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
          }}
        >
          <Kicker text={data.kicker} />
          <div style={{ fontFamily: theme.serif, fontWeight: 600, fontSize: 76, lineHeight: 1.2, marginTop: 28 }}>
            {done ? (
              <Highlighted text={data.text} highlight={data.highlight} delaySeconds={0.35 + data.text.length / 60} />
            ) : (
              data.text.slice(0, chars)
            )}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
