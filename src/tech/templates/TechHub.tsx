import { useCurrentFrame, useVideoConfig } from "remotion";
import { enter, pulse } from "../anim";
import { glow, neon } from "../theme";
import { Stage } from "./Stage";

// Nodes pop from 0.6 s, 0.25 s apart (pop SFX). Dots travel along connectors in `flow` direction.
export const TechHub: React.FC<{ data: { center: string; nodes: string[]; mode: "hub" | "orbit"; flow: "in" | "out" } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 1500;
  const H = 700;
  const cx = W / 2;
  const cy = H / 2;
  const n = data.nodes.length;
  const orbit = data.mode === "orbit";
  const rx = orbit ? 470 : 600;
  const ry = orbit ? 270 : 280;
  const spin = orbit ? (frame / fps) * 0.12 : 0;
  const c = enter(frame, fps, 0.1);
  const p = pulse(frame, fps, 1.8);

  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + spin;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  };

  return (
    <Stage>
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {orbit ? (
            <>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={neon.border} strokeWidth={2} />
              <ellipse cx={cx} cy={cy} rx={rx * 0.6} ry={ry * 0.6} fill="none" stroke={neon.border} strokeWidth={1.5} strokeDasharray="4 10" />
            </>
          ) : null}
          {data.nodes.map((_, i) => {
            const at = 0.6 + i * 0.25;
            const s = Math.min(1, enter(frame, fps, at));
            if (s <= 0) return null;
            const [x, y] = pos(i);
            const t = ((frame / fps) * 0.7 + i * 0.37) % 1;
            const k = data.flow === "out" ? t : 1 - t;
            const dx = cx + (x - cx) * k;
            const dy = cy + (y - cy) * k;
            return (
              <g key={i} opacity={s}>
                {!orbit ? (
                  <line x1={cx} y1={cy} x2={cx + (x - cx) * s} y2={cy + (y - cy) * s} stroke={neon.neonDim} strokeWidth={3} strokeDasharray="12 10" strokeDashoffset={-frame * (data.flow === "out" ? 1.5 : -1.5)} />
                ) : (
                  <line x1={cx} y1={cy} x2={x} y2={y} stroke={neon.border} strokeWidth={1.5} />
                )}
                <circle cx={dx} cy={dy} r={8} fill={neon.neon} style={{ filter: `drop-shadow(0 0 8px ${neon.neon})` }} />
              </g>
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            left: cx - 170,
            top: cy - 85,
            width: 340,
            height: 170,
            borderRadius: 26,
            background: neon.card,
            border: `3px solid ${neon.neon}`,
            boxShadow: glow(neon.neon, 0.6 + 0.6 * p),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: neon.display,
            fontSize: data.center.length > 11 ? 44 : 56,
            color: neon.neon,
            transform: `scale(${c})`,
            padding: 10,
          }}
        >
          {data.center}
        </div>
        {data.nodes.map((node, i) => {
          const at = 0.6 + i * 0.25;
          const s = enter(frame, fps, at);
          const [x, y] = pos(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 140,
                top: y - 42,
                width: 280,
                height: 84,
                borderRadius: 42,
                background: neon.cardHi,
                border: `2px solid ${neon.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: neon.mono,
                fontWeight: 700,
                fontSize: 30,
                color: neon.white,
                transform: `scale(${Math.max(0, s)})`,
              }}
            >
              {node}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
