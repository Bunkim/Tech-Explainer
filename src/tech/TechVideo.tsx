import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { FPS, sceneDurationInFrames, totalDurationInFrames } from "../vox/timing";
import { Backdrop, FOOTER_H, Footer, StepBar } from "./Frame";
import { neon } from "./theme";
import type { TechScene, TechVideoProps } from "./types";
import { TechBarRank } from "./templates/TechBarRank";
import { TechBigStat } from "./templates/TechBigStat";
import { TechChat } from "./templates/TechChat";
import { TechChecklist } from "./templates/TechChecklist";
import { TechFeed } from "./templates/TechFeed";
import { TechHeadline } from "./templates/TechHeadline";
import { TechHub } from "./templates/TechHub";
import { TechPhone } from "./templates/TechPhone";
import { TechSourceCheck } from "./templates/TechSourceCheck";
import { TechStatGrid } from "./templates/TechStatGrid";
import { TechTerminal } from "./templates/TechTerminal";
import { TechTimeline } from "./templates/TechTimeline";
import { TechVersus } from "./templates/TechVersus";

const SceneBody: React.FC<{ scene: TechScene }> = ({ scene }) => {
  switch (scene.scene) {
    case "techHeadline": return <TechHeadline data={scene.data} />;
    case "techChat": return <TechChat data={scene.data} />;
    case "techChecklist": return <TechChecklist data={scene.data} />;
    case "techStatGrid": return <TechStatGrid data={scene.data} />;
    case "techBigStat": return <TechBigStat data={scene.data} />;
    case "techBarRank": return <TechBarRank data={scene.data} />;
    case "techVersus": return <TechVersus data={scene.data} />;
    case "techFeed": return <TechFeed data={scene.data} />;
    case "techSourceCheck": return <TechSourceCheck data={scene.data} />;
    case "techTimeline": return <TechTimeline data={scene.data} />;
    case "techHub": return <TechHub data={scene.data} />;
    case "techTerminal": return <TechTerminal data={scene.data} />;
    case "techPhone": return <TechPhone data={scene.data} />;
    default: return null;
  }
};

const Caption: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: FOOTER_H + 14 }}>
    <div
      style={{
        maxWidth: 1500,
        textAlign: "center",
        fontFamily: neon.sans,
        fontWeight: 500,
        fontSize: 36,
        lineHeight: 1.3,
        color: neon.white,
        background: "rgba(0,0,0,0.6)",
        padding: "10px 24px",
        borderRadius: 10,
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 0.15 * fps], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const TechVideo: React.FC<TechVideoProps> = ({ scenes, captions, config }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: neon.bg }}>
      <Backdrop />
      {scenes.map((scene) => {
        const duration = sceneDurationInFrames(scene);
        const start = from;
        from += duration;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={duration} name={scene.id}>
            <FadeIn>
              <SceneBody scene={scene} />
            </FadeIn>
            <StepBar steps={config.steps} step={scene.hud?.step} status={scene.hud?.status} />
            {captions ? <Caption text={scene.narration} /> : null}
            {scene.voiceover ? <Audio src={staticFile(scene.voiceover)} /> : null}
            {(scene.sfx ?? []).map((cue, i) => (
              <Sequence key={i} from={Math.round(cue.at * FPS)} layout="none">
                <Audio src={staticFile(cue.file)} volume={cue.volume ?? 1} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Footer text={config.footer} />
    </AbsoluteFill>
  );
};

export const calculateTechMetadata: CalculateMetadataFunction<TechVideoProps> = ({ props }) => ({
  durationInFrames: totalDurationInFrames(props.scenes),
  fps: FPS,
});
