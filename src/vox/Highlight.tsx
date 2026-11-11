import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

/** Renders text, marking the first occurrence of `highlight` with an animated marker. */
export const Highlighted: React.FC<{
  text: string;
  highlight?: string;
  delaySeconds?: number;
  color?: string;
}> = ({ text, highlight, delaySeconds = 0.5, color = theme.orange }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || idx < 0) return <>{text}</>;

  const sweep = interpolate(frame, [delaySeconds * fps, (delaySeconds + 0.45) * fps], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {text.slice(0, idx)}
      <span
        style={{
          backgroundImage: `linear-gradient(${color}, ${color})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${sweep}% 0.32em`,
          backgroundPosition: "0 88%",
          padding: "0 0.05em",
        }}
      >
        {highlight}
      </span>
      {text.slice(idx + highlight.length)}
    </>
  );
};
