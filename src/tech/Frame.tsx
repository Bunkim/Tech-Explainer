import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pulse } from "./anim";
import { glow, neon } from "./theme";
import type { TechConfig } from "./types";

/** Space above the step bar (the ticker was removed). */
export const TOP_PAD = 18;
export const STEPS_H = 84;
export const FOOTER_H = 52;

export const StepBar: React.FC<{ steps: string[]; step?: number; status?: string }> = ({ steps, step = 1, status }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pulse(frame, fps, 1.2);
  return (
    <div
      style={{
        position: "absolute",
        top: TOP_PAD,
        left: 70,
        right: 70,
        height: STEPS_H,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < step;
        const current = idx === step;
        const color = done ? neon.neonDim : current ? neon.neon : neon.gray;
        return (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: color,
                boxShadow: current ? glow(neon.neon, 0.5 + 0.5 * p) : undefined,
              }}
            />
            <div
              style={{
                fontFamily: neon.mono,
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: current ? neon.neon : done ? neon.muted : neon.gray,
              }}
            >
              {done ? "✓ " : `${idx} `}
              {s}
            </div>
          </div>
        );
      })}
      {status ? <StatusChip text={status} /> : null}
    </div>
  );
};

const StatusChip: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blink = frame % fps < fps * 0.6 ? 1 : 0.25;
  const inP = interpolate(frame, [0, 0.3 * fps], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        marginLeft: 24,
        opacity: inP,
        padding: "8px 16px",
        borderRadius: 999,
        border: `1.5px solid ${neon.red}`,
        color: neon.red,
        fontFamily: neon.mono,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        background: "#FF4D5E14",
      }}
    >
      <span style={{ opacity: blink }}>●</span> {text}
    </div>
  );
};

export const Footer: React.FC<{ text?: string }> = ({ text }) =>
  text ? (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 70,
        right: 70,
        height: FOOTER_H,
        display: "flex",
        alignItems: "center",
        fontFamily: neon.mono,
        fontSize: 18,
        color: neon.muted,
        letterSpacing: "0.06em",
      }}
    >
      {text}
    </div>
  ) : null;

/** Background: near-black with a faint dot grid and vignette. */
export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: neon.bg,
      backgroundImage: `radial-gradient(${neon.border} 1.2px, transparent 1.2px), radial-gradient(ellipse at center, transparent 40%, #000 100%)`,
      backgroundSize: "36px 36px, 100% 100%",
    }}
  />
);

export type TechFrameConfig = TechConfig;
