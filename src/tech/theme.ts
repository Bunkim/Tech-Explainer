import { loadFont as loadDisplay } from "@remotion/google-fonts/Anton";
import { loadFont as loadSans } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const display = loadDisplay("normal", { weights: ["400"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["500", "700"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const neon = {
  bg: "#06090A",
  card: "#0D1214",
  cardHi: "#121A1C",
  border: "#1E2B2D",
  neon: "#39FF88",
  neonDim: "#1B7A45",
  white: "#F1F5F3",
  muted: "#7D8B87",
  gray: "#3A4644",
  red: "#FF4D5E",
  amber: "#FFB020",
  display: display.fontFamily,
  sans: sans.fontFamily,
  mono: mono.fontFamily,
};

export const glow = (color: string, strength = 1) =>
  `0 0 ${12 * strength}px ${color}AA, 0 0 ${36 * strength}px ${color}55`;

export const card: React.CSSProperties = {
  background: neon.card,
  border: `1.5px solid ${neon.border}`,
  borderRadius: 22,
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
};
