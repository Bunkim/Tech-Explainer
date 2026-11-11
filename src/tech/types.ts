// Scene format for the dark-UI "tech" templates (see docs/tech-templates-spec.md).
import type { SfxCue } from "../vox/types";

export type TechConfig = {
  theme?: string;
  ticker: string[];
  steps: string[];
  footer?: string;
};

type Base = {
  id: string;
  narration: string;
  hud?: { step?: number; status?: string };
  sfx?: SfxCue[];
  voiceover?: string;
  durationInSeconds?: number;
  source?: string;
  imageIdea?: string;
};

export type Trend = "up" | "down" | "flat";

export type TechScene =
  | (Base & { scene: "techHeadline"; data: { kicker?: string; top?: string; main: string } })
  | (Base & { scene: "techChat"; data: { window: string; sender?: string; lines: string[]; typing?: boolean } })
  | (Base & { scene: "techChecklist"; data: { title: string; items: string[]; state: "progress" | "done" | "fail"; stamp?: string } })
  | (Base & { scene: "techStatGrid"; data: { tiles: { label: string; value: string; trend?: Trend }[] } })
  | (Base & { scene: "techBigStat"; data: { value: number; prefix?: string; suffix?: string; label: string; sub?: string; points?: string[] } })
  | (Base & { scene: "techBarRank"; data: { title: string; unit?: string; items: { label: string; value: number; highlight?: boolean }[] } })
  | (Base & { scene: "techVersus"; data: { left: { title: string; items: string[] }; right: { title: string; items: string[] }; leftTone?: "good" | "bad" } })
  | (Base & { scene: "techFeed"; data: { title: string; items: { tag: string; text: string }[] } })
  | (Base & { scene: "techSourceCheck"; data: { claim: string; highlight?: string; source: string; detail?: string; verdict: string } })
  | (Base & { scene: "techTimeline"; data: { title: string; nodes: { label: string; sub?: string }[]; active: number } })
  | (Base & { scene: "techHub"; data: { center: string; nodes: string[]; mode: "hub" | "orbit"; flow: "in" | "out" } })
  | (Base & { scene: "techTerminal"; data: { title: string; lines: string[] } })
  | (Base & { scene: "techPhone"; data: { app: string; screenTitle: string; value: string; rows: string[]; banner?: string } });

export type TechVideoProps = {
  title: string;
  captions: boolean;
  config: TechConfig;
  scenes: TechScene[];
};
