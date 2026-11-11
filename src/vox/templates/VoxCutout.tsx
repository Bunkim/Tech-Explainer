import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, fadeUp, pop, typed } from "../anim";
import { theme } from "../theme";
import type { VoxCutoutData } from "../types";
import { Paper } from "./Paper";

const Icon: React.FC<{ kind?: "ruler" | "calendar" }> = ({ kind }) => {
  if (kind === "calendar")
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.paper} strokeWidth="2">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    );
  if (kind === "ruler")
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.paper} strokeWidth="2">
        <rect x="2" y="8" width="20" height="8" rx="1" />
        <path d="M6 8v4M10 8v3M14 8v4M18 8v3" />
      </svg>
    );
  return null;
};

export const VoxCutout: React.FC<{ data: VoxCutoutData; image?: string; narration: string }> = ({
  data,
  image,
  narration,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = ease(frame, fps, 0);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const statIn = pop(frame, fps, 0.85);

  return (
    <Paper>
      {/* Lilac panel on the right, like a split-screen editorial layout. */}
      <AbsoluteFill style={{ left: "52%", background: theme.lilacSoft }} />
      {image ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Img
            src={staticFile(image)}
            style={{
              maxHeight: "86%",
              maxWidth: "70%",
              objectFit: "contain",
              opacity: enter,
              transform: `scale(${zoom * interpolate(enter, [0, 1], [0.92, 1])})`,
              filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.25))",
            }}
          />
        </AbsoluteFill>
      ) : (
        // No cut-out yet: show the narration as a typewriter caption.
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px 0 160px", width: "52%" }}>
          <div
            style={{
              fontFamily: theme.mono,
              fontSize: 50,
              lineHeight: 1.35,
              ...fadeUp(enter),
            }}
          >
            {narration.slice(0, typed(frame, fps, narration, 30))}
            <span style={{ color: theme.orange, opacity: frame % 30 < 15 ? 1 : 0 }}>▌</span>
          </div>
        </AbsoluteFill>
      )}
      {data.stat ? (
        <div
          style={{
            position: "absolute",
            right: 140,
            bottom: 200,
            background: theme.orange,
            color: theme.paper,
            padding: "36px 48px",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            gap: 32,
            transform: `scale(${statIn})`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
          }}
        >
          <Icon kind={data.stat.icon} />
          <div>
            <div style={{ fontFamily: theme.serif, fontWeight: 800, fontSize: 110, lineHeight: 1 }}>
              {data.stat.value}
            </div>
            <div style={{ fontFamily: theme.mono, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em" }}>
              {data.stat.label}
            </div>
          </div>
        </div>
      ) : null}
    </Paper>
  );
};
