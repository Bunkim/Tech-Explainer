import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, slideIn } from "../anim";
import { card, glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

// Items light at 0.6 s + 0.4 s each (pin SFX); stamp 0.3 s after the last.
export const TechChecklist: React.FC<{
  data: { title: string; items: string[]; state: "progress" | "done" | "fail"; stamp?: string };
}> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = enter(frame, fps, 0);
  const n = data.items.length;
  const stampAt = 0.6 + n * 0.4 + 0.1;
  const s = enter(frame, fps, stampAt);
  const accent = data.state === "fail" ? neon.red : neon.neon;

  return (
    <Stage>
      <div style={{ ...card, ...slideIn(box, 40), width: 1100, padding: "40px 56px", position: "relative" }}>
        <Label color={accent} size={28} style={{ marginBottom: 26 }}>
          {data.title}
        </Label>
        {data.items.map((item, i) => {
          const at = 0.6 + i * 0.4;
          const lit = frame >= at * fps;
          const p = enter(frame, fps, at);
          const isLast = i === n - 1;
          const spinner = data.state === "progress" && isLast;
          const color = !lit ? neon.gray : data.state === "fail" ? neon.red : neon.neon;
          const icon = !lit ? "○" : spinner ? "◌" : data.state === "fail" ? "✕" : "✓";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "16px 0",
                borderTop: i ? `1px solid ${neon.border}` : undefined,
                opacity: interpolate(p, [0, 1], [0.35, 1], { extrapolateLeft: "clamp" }),
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  border: `2.5px solid ${color}`,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  boxShadow: lit ? glow(color, 0.4) : undefined,
                  transform: spinner && lit ? `rotate(${frame * 8}deg)` : `scale(${lit ? Math.min(1.15, 0.6 + p * 0.5) : 1})`,
                }}
              >
                {icon}
              </div>
              <div style={{ fontFamily: neon.sans, fontSize: 40, fontWeight: 500, color: lit ? neon.white : neon.muted }}>
                {item}
              </div>
            </div>
          );
        })}
        {data.stamp && frame >= stampAt * fps ? (
          <div
            style={{
              position: "absolute",
              right: 50,
              bottom: 40,
              transform: `rotate(-12deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`,
              opacity: Math.min(1, s),
              border: `5px solid ${accent}`,
              color: accent,
              borderRadius: 12,
              padding: "10px 26px",
              fontFamily: neon.display,
              fontSize: 64,
              letterSpacing: "0.06em",
              textShadow: glow(accent, 0.5),
            }}
          >
            {data.stamp}
          </div>
        ) : null}
      </div>
    </Stage>
  );
};
