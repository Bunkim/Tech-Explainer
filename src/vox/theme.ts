import { loadFont as loadSerif } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";

const serif = loadSerif("normal", { weights: ["600", "800"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

// Editorial palette: off-white paper, orange accent, lilac secondary.
export const theme = {
  paper: "#F4EFE6",
  ink: "#1C1A17",
  muted: "#6E6860",
  orange: "#F2622E",
  lilac: "#B9A7E8",
  lilacSoft: "#E4DCF7",
  grid: "#DDD5C8",
  serif: serif.fontFamily,
  sans: sans.fontFamily,
  mono: mono.fontFamily,
};
