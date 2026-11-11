import { useCurrentFrame, useVideoConfig } from "remotion";
import { enter, slideIn } from "../anim";
import { card, glow, neon } from "../theme";
import { Stage } from "./Stage";

type Col = { title: string; items: string[] };

const Column: React.FC<{ col: Col; tone: "good" | "bad"; at: number; side: "left" | "right" }> = ({ col, tone, at, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, at);
  const color = tone === "good" ? neon.neon : neon.red;
  return (
    <div
      style={{
        ...card,
        opacity: Math.min(1, p),
        transform: `translateX(${(1 - Math.min(1, p)) * (side === "left" ? -80 : 80)}px)`,
        width: 700,
        padding: "40px 48px",
        borderTop: `6px solid ${color}`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), ${glow(color, 0.25)}`,
      }}
    >
      <div style={{ fontFamily: neon.display, fontSize: 64, color, letterSpacing: "0.03em", textShadow: glow(color, 0.4), marginBottom: 24 }}>
        {col.title}
      </div>
      {col.items.map((it, i) => (
        <div key={i} style={{ ...slideIn(enter(frame, fps, at + 0.15 + i * 0.12), 16), display: "flex", gap: 20, alignItems: "center", padding: "14px 0", fontFamily: neon.sans, fontSize: 40, color: neon.white }}>
          <span style={{ color, fontWeight: 700 }}>{tone === "good" ? "✓" : "✕"}</span>
          {it}
        </div>
      ))}
    </div>
  );
};

// Columns pop at 0.6 s and 1.0 s (pop SFX).
export const TechVersus: React.FC<{ data: { left: Col; right: Col; leftTone?: "good" | "bad" } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leftTone = data.leftTone ?? "good";
  const rightTone = leftTone === "good" ? "bad" : "good";
  const vs = enter(frame, fps, 0.85);
  return (
    <Stage style={{ flexDirection: "row", gap: 60 }}>
      <Column col={data.left} tone={leftTone} at={0.6} side="left" />
      <div style={{ ...slideIn(vs, 0), fontFamily: neon.display, fontSize: 64, color: neon.muted, transform: `scale(${Math.min(1.2, vs)})` }}>VS</div>
      <Column col={data.right} tone={rightTone} at={1.0} side="right" />
    </Stage>
  );
};
