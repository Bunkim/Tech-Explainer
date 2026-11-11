import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, slideIn, typedChars } from "../anim";
import { card, glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

// Claim types from 0.3 s (typewriter SFX), source card follows, verdict stamps at 1.6 s.
export const TechSourceCheck: React.FC<{
  data: { claim: string; highlight?: string; source: string; detail?: string; verdict: string };
}> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = enter(frame, fps, 0);
  const n = typedChars(frame, fps, data.claim, 0.3, 90);
  const typedDone = n >= data.claim.length;
  const src = enter(frame, fps, 1.1);
  const v = enter(frame, fps, 1.6);
  const vColor = /CONFIRM/.test(data.verdict) ? neon.neon : neon.amber;
  const idx = data.highlight ? data.claim.indexOf(data.highlight) : -1;
  const sweep = interpolate(frame, [1.3 * fps, 1.7 * fps], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const claimText =
    typedDone && idx >= 0 && data.highlight ? (
      <>
        {data.claim.slice(0, idx)}
        <span
          style={{
            color: neon.neon,
            backgroundImage: `linear-gradient(${neon.neon}, ${neon.neon})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${sweep}% 4px`,
            backgroundPosition: "0 100%",
          }}
        >
          {data.highlight}
        </span>
        {data.claim.slice(idx + data.highlight.length)}
      </>
    ) : (
      data.claim.slice(0, n)
    );

  return (
    <Stage>
      <div style={{ width: 1400, position: "relative" }}>
        <div style={{ ...card, ...slideIn(box, 40), padding: "40px 52px" }}>
          <Label size={24} style={{ marginBottom: 18 }}>
            Claim
          </Label>
          <div style={{ fontFamily: neon.sans, fontWeight: 500, fontSize: 52, lineHeight: 1.3, color: neon.white, minHeight: 140 }}>
            “{claimText}”
          </div>
        </div>
        <div style={{ ...card, ...slideIn(src, 30), marginTop: 22, padding: "24px 52px", display: "inline-flex", gap: 24, alignItems: "center", maxWidth: 1050, whiteSpace: "nowrap" }}>
          <Label size={22}>Source</Label>
          <div style={{ fontFamily: neon.mono, fontSize: 30, color: neon.white, fontWeight: 700 }}>{data.source}</div>
          {data.detail ? <div style={{ fontFamily: neon.mono, fontSize: 24, color: neon.muted }}>· {data.detail}</div> : null}
        </div>
        {frame >= 1.6 * fps ? (
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -46,
              transform: `rotate(-8deg) scale(${interpolate(v, [0, 1], [2, 1])})`,
              opacity: Math.min(1, v),
              border: `5px solid ${vColor}`,
              borderRadius: 14,
              padding: "12px 30px",
              color: vColor,
              fontFamily: neon.display,
              fontSize: 64,
              letterSpacing: "0.05em",
              background: neon.bg,
              textShadow: glow(vColor, 0.5),
              boxShadow: glow(vColor, 0.3),
            }}
          >
            {data.verdict}
          </div>
        ) : null}
      </div>
    </Stage>
  );
};
