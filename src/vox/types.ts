// Scene format produced by the tech-explainer / vox-finance-explainer skills.

export type SfxCue = { file: string; at: number; volume?: number };

type Base = {
  id: string;
  narration: string;
  sfx?: SfxCue[];
  /** Optional cut-out PNG under public/, e.g. "cutouts/phone.png". */
  image?: string;
  /** Optional voiceover file under public/, e.g. "voiceover/vox-001.mp3". */
  voiceover?: string;
  /** Overrides the duration estimated from the narration. */
  durationInSeconds?: number;
  source?: string;
  imageIdea?: string;
};

export type VoxTitleData = { kicker: string; title: string; highlight?: string };
export type VoxCutoutData = {
  stat?: { value: string; label: string; icon?: "ruler" | "calendar" };
};
export type BarItem = { label: string; value: number; highlight?: boolean };
export type LineSeries = { name: string; values: number[]; highlight?: boolean };
export type VoxChartData =
  | { mode: "bar"; title: string; unit?: string; items: BarItem[] }
  | { mode: "line"; title: string; unit?: string; labels: string[]; series: LineSeries[] };
export type VoxBigNumberData = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};
export type VoxBubblesData = { items: string[] };
export type VoxNoteData = { kicker: string; text: string; highlight?: string };

export type VoxScene =
  | (Base & { scene: "voxTitle"; data: VoxTitleData })
  | (Base & { scene: "voxCutout"; data: VoxCutoutData })
  | (Base & { scene: "voxChart"; data: VoxChartData })
  | (Base & { scene: "voxBigNumber"; data: VoxBigNumberData })
  | (Base & { scene: "voxBubbles"; data: VoxBubblesData })
  | (Base & { scene: "voxNote"; data: VoxNoteData });

export type VoxVideoProps = {
  title: string;
  /** Show the narration as a caption at the bottom of each scene. */
  captions: boolean;
  scenes: VoxScene[];
};
