import { useCurrentFrame, useVideoConfig } from "remotion";
import { enter } from "../anim";
import { card, glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

// Cards stack in from 0.5 s, 0.4 s apart (pin SFX).
export const TechFeed: React.FC<{ data: { title: string; items: { tag: string; text: string }[] } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <div style={{ width: 1300 }}>
        <Label color={neon.neon} size={30} style={{ marginBottom: 26, opacity: Math.min(1, enter(frame, fps, 0)) }}>
          ◆ {data.title}
        </Label>
        {data.items.map((it, i) => {
          const at = 0.5 + i * 0.4;
          const p = enter(frame, fps, at);
          const latest = i === data.items.length - 1 && frame >= at * fps;
          return (
            <div
              key={i}
              style={{
                ...card,
                opacity: Math.min(1, p),
                transform: `translateX(${(1 - Math.min(1, p)) * 160}px)`,
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "26px 34px",
                marginBottom: 20,
                borderLeft: `6px solid ${neon.neon}`,
                boxShadow: latest ? `0 20px 50px rgba(0,0,0,0.5), ${glow(neon.neon, 0.25)}` : card.boxShadow,
              }}
            >
              <div
                style={{
                  minWidth: 200,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "#39FF8818",
                  color: neon.neon,
                  fontFamily: neon.mono,
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "0.08em",
                  textAlign: "center",
                }}
              >
                {it.tag}
              </div>
              <div style={{ fontFamily: neon.sans, fontSize: 40, color: neon.white }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
