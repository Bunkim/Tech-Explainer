import type { VoxScene } from "./types";

export const FPS = 30;
export const WORDS_PER_MINUTE = 140;
const PADDING_SECONDS = 0.6;
const MIN_SECONDS = 3;

export const sceneDurationInFrames = (scene: VoxScene): number => {
  if (scene.durationInSeconds && scene.durationInSeconds > 0) {
    return Math.round(scene.durationInSeconds * FPS);
  }
  const words = scene.narration.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(MIN_SECONDS, (words / WORDS_PER_MINUTE) * 60 + PADDING_SECONDS);
  return Math.round(seconds * FPS);
};

export const totalDurationInFrames = (scenes: VoxScene[]): number =>
  Math.max(1, scenes.reduce((sum, s) => sum + sceneDurationInFrames(s), 0));
