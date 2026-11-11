import { AbsoluteFill } from "remotion";
import { STEPS_H, TOP_PAD } from "../Frame";
import { neon } from "../theme";

/** Content area between the step bar and the caption/footer. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill
    style={{
      top: TOP_PAD + STEPS_H + 10,
      bottom: 150,
      left: 110,
      right: 110,
      width: "auto",
      height: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color,
  size = 26,
  style,
}) => {
  return (
    <div
      style={{
        fontFamily: neon.mono,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.14em",
        color: color ?? neon.muted,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
