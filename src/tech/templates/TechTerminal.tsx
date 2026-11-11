import { useCurrentFrame, useVideoConfig } from "remotion";
import { enter, slideIn } from "../anim";
import { card, glow, neon } from "../theme";
import { Stage } from "./Stage";

const CPS = 40;

// Lines type out one after another from 0 s (typewriter SFX); the last line flashes.
export const TechTerminal: React.FC<{ data: { title: string; lines: string[] } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = enter(frame, fps, 0);
  const t = Math.max(0, frame / fps - 0.2);
  let budget = t * CPS;
  const shown = data.lines.map((l) => {
    const take = Math.max(0, Math.min(l.length, Math.floor(budget)));
    budget -= l.length + 6; // short pause between lines
    return l.slice(0, take);
  });
  const allDone = budget > 0;
  const activeIdx = shown.findIndex((s, i) => s.length < data.lines[i].length);
  const flash = allDone && Math.floor(frame / 8) % 2 === 0;

  return (
    <Stage>
      <div style={{ ...card, ...slideIn(box, 40), width: 1400, overflow: "hidden", background: "#050807" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1.5px solid ${neon.border}`, background: neon.cardHi }}>
          {[neon.red, neon.amber, neon.neon].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.8 }} />
          ))}
          <div style={{ marginLeft: 16, fontFamily: neon.mono, fontSize: 24, color: neon.muted }}>{data.title}</div>
        </div>
        <div style={{ padding: "34px 44px", minHeight: 380 }}>
          {shown.map((s, i) => {
            const last = i === data.lines.length - 1;
            const cursorHere = i === activeIdx || (allDone && last);
            if (!s && i !== activeIdx) return null;
            const color = last && allDone ? (flash ? neon.neon : neon.white) : s.startsWith("$") ? neon.white : neon.neon;
            return (
              <div
                key={i}
                style={{
                  fontFamily: neon.mono,
                  fontSize: 38,
                  lineHeight: 1.6,
                  color,
                  whiteSpace: "pre",
                  textShadow: last && allDone && flash ? glow(neon.neon, 0.6) : `0 0 8px ${neon.neon}44`,
                }}
              >
                {s}
                {cursorHere && frame % 30 < 16 ? <span style={{ color: neon.neon }}>█</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};
