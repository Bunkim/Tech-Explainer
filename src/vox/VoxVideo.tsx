import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { theme } from "./theme";
import { FPS, sceneDurationInFrames, totalDurationInFrames } from "./timing";
import type { VoxScene, VoxVideoProps } from "./types";
import { VoxBigNumber } from "./templates/VoxBigNumber";
import { VoxBubbles } from "./templates/VoxBubbles";
import { VoxChart } from "./templates/VoxChart";
import { VoxCutout } from "./templates/VoxCutout";
import { VoxNote } from "./templates/VoxNote";
import { VoxTitle } from "./templates/VoxTitle";

const SceneBody: React.FC<{ scene: VoxScene }> = ({ scene }) => {
  switch (scene.scene) {
    case "voxTitle":
      return <VoxTitle data={scene.data} />;
    case "voxCutout":
      return <VoxCutout data={scene.data} image={scene.image} narration={scene.narration} />;
    case "voxChart":
      return <VoxChart data={scene.data} />;
    case "voxBigNumber":
      return <VoxBigNumber data={scene.data} />;
    case "voxBubbles":
      return <VoxBubbles data={scene.data} />;
    case "voxNote":
      return <VoxNote data={scene.data} />;
    default:
      return null;
  }
};

const Caption: React.FC<{ text: string; dark: boolean }> = ({ text, dark }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 56 }}>
    <div
      style={{
        maxWidth: 1500,
        textAlign: "center",
        fontFamily: theme.sans,
        fontWeight: 600,
        fontSize: 38,
        lineHeight: 1.3,
        color: dark ? theme.paper : theme.ink,
        background: dark ? "rgba(0,0,0,0.35)" : "rgba(244,239,230,0.85)",
        padding: "10px 24px",
        borderRadius: 10,
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

/** Short cross-fade in at the start of each scene. */
const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const VoxVideo: React.FC<VoxVideoProps> = ({ scenes, captions }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.paper }}>
      {scenes.map((scene) => {
        const duration = sceneDurationInFrames(scene);
        const start = from;
        from += duration;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={duration} name={scene.id}>
            <FadeIn>
              <SceneBody scene={scene} />
            </FadeIn>
            {captions ? <Caption text={scene.narration} dark={scene.scene === "voxBigNumber"} /> : null}
            {scene.voiceover ? <Audio src={staticFile(scene.voiceover)} /> : null}
            {(scene.sfx ?? []).map((cue, i) => (
              <Sequence key={i} from={Math.round(cue.at * FPS)} layout="none">
                <Audio src={staticFile(cue.file)} volume={cue.volume ?? 1} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const calculateVoxMetadata: CalculateMetadataFunction<VoxVideoProps> = ({ props }) => ({
  durationInFrames: totalDurationInFrames(props.scenes),
  fps: FPS,
});
