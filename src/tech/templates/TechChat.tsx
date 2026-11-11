import { useCurrentFrame, useVideoConfig } from "remotion";
import { enter, slideIn, typedChars } from "../anim";
import { card, neon } from "../theme";
import { Stage } from "./Stage";

export const TechChat: React.FC<{ data: { window: string; sender?: string; lines: string[]; typing?: boolean } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = enter(frame, fps, 0);
  const isSearch = !data.sender;
  // Lines appear one by one from 0.3 s; the last types out if `typing`.
  const lineAt = (i: number) => 0.35 + i * 0.55;

  return (
    <Stage>
      <div style={{ ...card, ...slideIn(win, 50), width: 1240, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 26px",
            borderBottom: `1.5px solid ${neon.border}`,
            background: neon.cardHi,
          }}
        >
          {[neon.red, neon.amber, neon.neon].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.8 }} />
          ))}
          <div style={{ marginLeft: 16, fontFamily: neon.mono, fontSize: 24, color: neon.muted }}>{data.window}</div>
        </div>
        <div style={{ padding: "34px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          {data.sender ? (
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: `linear-gradient(135deg, ${neon.gray}, ${neon.border})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: neon.sans,
                  fontWeight: 700,
                  fontSize: 28,
                  color: neon.white,
                }}
              >
                {data.sender.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div style={{ fontFamily: neon.sans, fontWeight: 700, fontSize: 32, color: neon.white }}>{data.sender}</div>
            </div>
          ) : null}
          {data.lines.map((line, i) => {
            const at = lineAt(i);
            const last = i === data.lines.length - 1;
            const p = enter(frame, fps, at);
            const typing = data.typing && last;
            const shown = typing ? line.slice(0, typedChars(frame, fps, line, at, 28)) : line;
            const cursor = typing && frame % 30 < 16;
            if (frame < at * fps) return null;
            return isSearch ? (
              <div
                key={i}
                style={{
                  border: `2px solid ${neon.neon}`,
                  borderRadius: 999,
                  padding: "22px 34px",
                  fontFamily: neon.mono,
                  fontSize: 38,
                  color: neon.white,
                  display: "flex",
                  gap: 18,
                }}
              >
                <span style={{ color: neon.neon }}>⌕</span>
                {shown}
                {cursor ? <span style={{ color: neon.neon }}>▌</span> : null}
              </div>
            ) : (
              <div
                key={i}
                style={{
                  ...slideIn(typing ? 1 : p, 20),
                  alignSelf: "flex-start",
                  background: neon.cardHi,
                  border: `1.5px solid ${neon.border}`,
                  borderRadius: "6px 24px 24px 24px",
                  padding: "18px 28px",
                  fontFamily: neon.sans,
                  fontSize: 38,
                  color: neon.white,
                }}
              >
                {shown}
                {cursor ? <span style={{ color: neon.neon }}>▌</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};
