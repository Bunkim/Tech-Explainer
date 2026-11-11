import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, pulse, slideIn } from "../anim";
import { glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

// Nodes pin in from 0.5 s, 0.35 s apart (pin SFX). Nodes up to `active` are lit.
export const TechTimeline: React.FC<{ data: { title: string; nodes: { label: string; sub?: string }[]; active: number } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = data.nodes.length;
  const W = 1560;
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const activeAt = 0.5 + data.active * 0.35;
  const fill = interpolate(frame, [0.5 * fps, (activeAt + 0.2) * fps], [0, x(data.active)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = pulse(frame, fps, 1.1);

  return (
    <Stage>
      <Label color={neon.neon} size={32} style={{ ...slideIn(enter(frame, fps, 0)), marginBottom: 110 }}>
        {data.title}
      </Label>
      <div style={{ position: "relative", width: W, height: 260 }}>
        <div style={{ position: "absolute", top: 40, left: 0, width: W, height: 6, background: neon.gray, borderRadius: 3 }} />
        <div style={{ position: "absolute", top: 40, left: 0, width: fill, height: 6, background: neon.neon, borderRadius: 3, boxShadow: glow(neon.neon, 0.5) }} />
        {data.nodes.map((node, i) => {
          const at = 0.5 + i * 0.35;
          const s = enter(frame, fps, at);
          const lit = i <= data.active && frame >= at * fps;
          const isActive = i === data.active && lit;
          const color = lit ? neon.neon : neon.gray;
          return (
            <div key={i} style={{ position: "absolute", left: x(i) - 120, width: 240, top: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  background: lit ? neon.neon : neon.bg,
                  border: `5px solid ${color}`,
                  transform: `scale(${Math.min(1, s) * (isActive ? 1 + 0.12 * p : 1)})`,
                  boxShadow: isActive ? glow(neon.neon, 0.8 + p) : lit ? glow(neon.neon, 0.3) : undefined,
                }}
              />
              <div style={{ ...slideIn(s, 16), marginTop: 26, fontFamily: neon.display, fontSize: 52, color: lit ? neon.white : neon.muted }}>{node.label}</div>
              {node.sub ? (
                <div style={{ ...slideIn(s, 16), fontFamily: neon.mono, fontSize: 26, color: lit ? neon.neon : neon.muted, textAlign: "center" }}>
                  {node.sub}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
