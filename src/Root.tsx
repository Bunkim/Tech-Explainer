import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import sample from "../vox-scripts/sample.json";
import { FPS } from "./vox/timing";
import type { VoxVideoProps } from "./vox/types";
import { VoxVideo, calculateVoxMetadata } from "./vox/VoxVideo";
import techSample from "../vox-scripts/binance-heist.json";
import type { TechVideoProps } from "./tech/types";
import { TechVideo, calculateTechMetadata } from "./tech/TechVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ title: "Tech Explainer" }}
      />
      {/* Renders a scene script from the tech-explainer skill.
          Swap the script with: --props=vox-scripts/<name>.json */}
      <Composition
        id="VoxVideo"
        component={VoxVideo}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={1}
        defaultProps={sample as unknown as VoxVideoProps}
        calculateMetadata={calculateVoxMetadata}
      />
      {/* Dark-neon tech templates. Swap the script with: --props=vox-scripts/<name>.json */}
      <Composition
        id="TechVideo"
        component={TechVideo}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={1}
        defaultProps={techSample as unknown as TechVideoProps}
        calculateMetadata={calculateTechMetadata}
      />
    </>
  );
};
