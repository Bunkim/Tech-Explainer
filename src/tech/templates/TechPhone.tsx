import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, pulse } from "../anim";
import { glow, neon } from "../theme";
import { Stage } from "./Stage";

// Phone rises in with a 3D tilt; the banner slides down at 1.0 s (pop SFX).
export const TechPhone: React.FC<{ data: { app: string; screenTitle: string; value: string; rows: string[]; banner?: string } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const rise = enter(frame, fps, 0);
  const b = enter(frame, fps, 1.0);
  const p = pulse(frame, fps, 2);
  const tilt = interpolate(frame, [0, durationInFrames], [-14, -8]);
  const alert = /suspend|block|fail|stop|frozen|halt/i.test(data.banner ?? data.value);
  const accent = alert ? neon.red : neon.neon;

  return (
    <Stage style={{ perspective: 1800 }}>
      <div
        style={{
          width: 400,
          height: 760,
          borderRadius: 64,
          background: "#0A0F10",
          border: `3px solid ${neon.gray}`,
          boxShadow: `0 60px 100px rgba(0,0,0,0.7), ${glow(accent, 0.15 + 0.15 * p)}`,
          transform: `translateY(${interpolate(rise, [0, 1], [500, 0])}px) rotateY(${tilt}deg) rotateX(8deg)`,
          padding: 22,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ width: 130, height: 34, borderRadius: 17, background: "#000", margin: "4px auto 26px" }} />
        <div style={{ fontFamily: neon.mono, fontSize: 22, color: neon.muted, letterSpacing: "0.1em", textAlign: "center" }}>{data.app.toUpperCase()}</div>
        <div style={{ fontFamily: neon.sans, fontWeight: 700, fontSize: 40, color: neon.white, textAlign: "center", marginTop: 10 }}>{data.screenTitle}</div>
        <div style={{ fontFamily: neon.display, fontSize: 76, color: accent, textAlign: "center", marginTop: 22, textShadow: glow(accent, 0.6) }}>{data.value}</div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 16 }}>
          {data.rows.map((r, i) => (
            <div key={i} style={{ background: neon.card, border: `1.5px solid ${neon.border}`, borderRadius: 18, padding: "18px 20px", fontFamily: neon.sans, fontSize: 25, color: neon.white, opacity: Math.min(1, enter(frame, fps, 0.5 + i * 0.2)) }}>
              {r}
            </div>
          ))}
        </div>
        {data.banner ? (
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: 14,
              transform: `translateY(${interpolate(b, [0, 1], [-160, 0])}px)`,
              background: accent,
              color: neon.bg,
              borderRadius: 22,
              padding: "20px 22px",
              fontFamily: neon.sans,
              fontWeight: 700,
              fontSize: 26,
              boxShadow: glow(accent, 0.6),
            }}
          >
            {alert ? "⚠ " : "✓ "}
            {data.banner}
          </div>
        ) : null}
      </div>
    </Stage>
  );
};
