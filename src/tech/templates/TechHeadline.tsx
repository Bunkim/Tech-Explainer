import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, pulse, slideIn } from "../anim";
import { glow, neon } from "../theme";
import { Label, Stage } from "./Stage";

/** RGB-split glitch strength: strong on entry (first 0.45 s) and exit (last 0.3 s), with rare blips. */
const glitchAmount = (frame: number, fps: number, duration: number) => {
  const inG = interpolate(frame, [0, 0.45 * fps], [1, 0], { extrapolateRight: "clamp" });
  const outG = interpolate(frame, [duration - 0.3 * fps, duration], [0, 1], { extrapolateLeft: "clamp" });
  const blip = random(`blip-${Math.floor(frame / 3)}`) > 0.97 ? 0.4 : 0;
  return Math.max(inG, outG, blip);
};

export const TechHeadline: React.FC<{ data: { kicker?: string; top?: string; main: string } }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const g = glitchAmount(frame, fps, durationInFrames);
  const jitter = (k: string) => (random(`${k}-${frame}`) - 0.5) * 30 * g;
  const k = enter(frame, fps, 0.05);
  const t = enter(frame, fps, 0.15);
  const m = enter(frame, fps, 0.3);
  const p = pulse(frame, fps, 2);
  const mainSize = data.main.length > 12 ? 200 : 240;

  return (
    <Stage>
      {data.kicker ? (
        <Label color={neon.neon} size={30} style={{ ...slideIn(k), marginBottom: 18, letterSpacing: "0.3em" }}>
          {data.kicker}
        </Label>
      ) : null}
      {data.top ? (
        <div
          style={{
            ...slideIn(t),
            fontFamily: neon.sans,
            fontWeight: 700,
            fontSize: 64,
            color: neon.white,
            letterSpacing: "0.04em",
            transform: `translateX(${jitter("top")}px)`,
          }}
        >
          {data.top}
        </div>
      ) : null}
      <div
        style={{
          opacity: Math.min(1, m),
          fontFamily: neon.display,
          fontSize: mainSize,
          lineHeight: 1.05,
          color: neon.neon,
          textAlign: "center",
          transform: `translateX(${jitter("main")}px) scale(${interpolate(m, [0, 1], [1.15, 1])})`,
          textShadow: `${glow(neon.neon, 0.8 + 0.4 * p)}, ${-14 * g}px 0 0 #FF2D55CC, ${14 * g}px 0 0 #2DE2FFCC`,
          clipPath:
            g > 0.15
              ? `inset(${Math.floor(random(`c-${frame}`) * 40)}% 0 ${Math.floor(random(`d-${frame}`) * 30)}% 0)`
              : undefined,
        }}
      >
        {data.main}
      </div>
    </Stage>
  );
};
