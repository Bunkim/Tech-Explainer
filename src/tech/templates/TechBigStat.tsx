import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, fmtNum, pulse, slideIn } from "../anim";
import { glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

// Counts up and lands at 1.2 s (pop SFX); points light up afterwards.
export const TechBigStat: React.FC<{
  data: { value: number; prefix?: string; suffix?: string; label: string; sub?: string; points?: string[] };
}> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = interpolate(frame, [0, 1.2 * fps], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const decimals = (String(data.value).split(".")[1] ?? "").length;
  const land = enter(frame, fps, 1.2);
  const p = pulse(frame, fps, 2);
  const ringR = 330;

  return (
    <Stage>
      <svg width={ringR * 2 + 40} height={ringR * 2 + 40} style={{ position: "absolute", opacity: 0.5 }}>
        <circle cx={ringR + 20} cy={ringR + 20} r={ringR} fill="none" stroke={neon.border} strokeWidth={3} />
        <circle cx={ringR + 20} cy={ringR + 20} r={ringR} fill="none" stroke={neon.neon} strokeWidth={4}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c}
          transform={`rotate(-90 ${ringR + 20} ${ringR + 20})`} style={{ filter: `drop-shadow(0 0 10px ${neon.neon})` }} />
      </svg>
      <div
        style={{
          fontFamily: neon.display,
          fontSize: 300,
          lineHeight: 1,
          color: neon.neon,
          textShadow: glow(neon.neon, 0.8 + 0.5 * p),
          transform: `scale(${1 + 0.05 * Math.sin(Math.min(1, land) * Math.PI)})`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {data.prefix}
        {fmtNum(data.value * c, decimals)}
        {data.suffix}
      </div>
      <Label color={neon.white} size={40} style={{ ...slideIn(land), marginTop: 18 }}>
        {data.label}
      </Label>
      {data.sub ? (
        <div style={{ ...slideIn(enter(frame, fps, 1.4)), fontFamily: neon.mono, fontSize: 28, color: neon.muted, marginTop: 14 }}>
          {data.sub}
        </div>
      ) : null}
      {data.points && data.points.length ? (
        <div style={{ display: "flex", gap: 20, marginTop: 34 }}>
          {data.points.map((pt, i) => {
            const at = 1.6 + i * 0.3;
            const lit = frame >= at * fps;
            return (
              <div
                key={pt}
                style={{
                  ...slideIn(enter(frame, fps, at), 16),
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: `2px solid ${lit ? neon.neon : neon.gray}`,
                  color: lit ? neon.neon : neon.muted,
                  fontFamily: neon.mono,
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "0.08em",
                  boxShadow: lit ? glow(neon.neon, 0.25) : undefined,
                }}
              >
                {pt}
              </div>
            );
          })}
        </div>
      ) : null}
    </Stage>
  );
};
