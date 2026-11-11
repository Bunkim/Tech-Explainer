import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, fmtNum, slideIn } from "../anim";
import { card, glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

// Bars grow from 0.7 s, 0.3 s apart (pop SFX).
export const TechBarRank: React.FC<{
  data: { title: string; unit?: string; items: { label: string; value: number; highlight?: boolean }[] };
}> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enter(frame, fps, 0);
  const max = Math.max(...data.items.map((i) => i.value), 1);
  const decimals = Math.max(...data.items.map((i) => (String(i.value).split(".")[1] ?? "").length));
  const rowH = data.items.length > 3 ? 92 : 120;
  const barMax = 1080;

  return (
    <Stage>
      <div style={{ ...card, ...slideIn(head, 40), width: 1560, padding: "44px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 30 }}>
          <div style={{ fontFamily: neon.sans, fontWeight: 700, fontSize: 48, color: neon.white }}>{data.title}</div>
          {data.unit ? <Label size={24}>{data.unit}</Label> : null}
        </div>
        {data.items.map((item, i) => {
          const at = 0.7 + i * 0.3;
          const g = interpolate(frame, [at * fps, (at + 0.7) * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
          const color = item.highlight ? neon.neon : neon.gray;
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "center", height: rowH, gap: 30 }}>
              <div style={{ width: 280, fontFamily: neon.mono, fontSize: 30, color: item.highlight ? neon.white : neon.muted, textAlign: "right" }}>
                {item.label}
              </div>
              <div
                style={{
                  height: rowH * 0.58,
                  width: Math.max(6, (item.value / max) * barMax * g),
                  background: color,
                  borderRadius: 8,
                  boxShadow: item.highlight ? glow(neon.neon, 0.6) : undefined,
                }}
              />
              <div style={{ fontFamily: neon.display, fontSize: 52, color: item.highlight ? neon.neon : neon.white, opacity: g }}>
                {fmtNum(item.value * g, decimals)}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
