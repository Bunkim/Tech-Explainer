import { interpolate, spring } from "remotion";

export const pop = (frame: number, fps: number, delaySeconds = 0) =>
  spring({ frame: frame - delaySeconds * fps, fps, config: { damping: 14, stiffness: 160 } });

export const ease = (frame: number, fps: number, delaySeconds = 0) =>
  spring({ frame: frame - delaySeconds * fps, fps, config: { damping: 200 } });

export const fadeUp = (progress: number) => ({
  opacity: progress,
  transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
});

/** Number of characters to reveal for a typewriter effect. */
export const typed = (frame: number, fps: number, text: string, charsPerSecond = 38, delaySeconds = 0) =>
  Math.max(0, Math.min(text.length, Math.floor(((frame - delaySeconds * fps) / fps) * charsPerSecond)));
