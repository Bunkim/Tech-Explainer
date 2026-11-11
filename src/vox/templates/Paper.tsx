import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

/** Off-white paper background with a faint report grid. */
export const Paper: React.FC<{ children: React.ReactNode; tint?: string }> = ({ children, tint }) => (
  <AbsoluteFill
    style={{
      backgroundColor: tint ?? theme.paper,
      backgroundImage: `linear-gradient(${theme.grid}55 1px, transparent 1px), linear-gradient(90deg, ${theme.grid}55 1px, transparent 1px)`,
      backgroundSize: "80px 80px",
      color: theme.ink,
      fontFamily: theme.sans,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Kicker: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <div
    style={{
      fontFamily: theme.mono,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: "0.18em",
      color: theme.orange,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {text}
  </div>
);
