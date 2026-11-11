import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, fmtNum, slideIn, splitNumber } from "../anim";
import { card, glow, neon } from "../theme";
import type { Trend } from "../types";
import { Sparkline } from "./Sparkline";
import { Label, Stage } from "./Stage";

const trendColor = (t?: Trend) => (t === "down" ? neon.red : t === "up" ? neon.neon : neon.white);
const trendIcon = (t?: Trend) => (t === "down" ? "▼" : t === "up" ? "▲" : "▬");

// Tiles pop at 0.5 s + 0.3 s each (pop SFX).
export const TechStatGrid: React.FC<{ data: { tiles: { label: string; value: string; trend?: Trend }[] } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = data.tiles.length;
  const cols = n === 4 ? 2 : n;
  const tileW = n === 4 ? 760 : n === 3 ? 520 : 700;

  return (
    <Stage>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${tileW}px)`, gap: 34 }}>
        {data.tiles.map((tile, i) => {
          const at = 0.5 + i * 0.3;
          const p = enter(frame, fps, at);
          const count = interpolate(frame, [at * fps, (at + 1) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const parsed = splitNumber(tile.value);
          const shown = parsed ? `${parsed.pre}${fmtNum(parsed.num * count, parsed.decimals, parsed.commas)}${parsed.post}` : tile.value;
          const color = trendColor(tile.trend);
          return (
            <div key={i} style={{ ...card, ...slideIn(p, 40), padding: "30px 38px", height: n === 4 ? 250 : 330, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Label size={24}>{tile.label}</Label>
                <span style={{ color, fontSize: 26 }}>{trendIcon(tile.trend)}</span>
              </div>
              <div style={{ fontFamily: neon.display, fontSize: n === 4 ? 96 : 120, color: neon.white, lineHeight: 1, textShadow: tile.trend === "up" ? glow(neon.neon, 0.3) : undefined }}>
                {shown}
              </div>
              <Sparkline trend={tile.trend ?? "flat"} color={color} seed={tile.label} progress={count} w={tileW - 80} h={n === 4 ? 46 : 70} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
