import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, fadeUp, pop } from "../anim";
import { theme } from "../theme";
import type { BarItem, LineSeries, VoxChartData } from "../types";
import { Kicker, Paper } from "./Paper";

const fmt = (n: number) =>
  Math.abs(n) >= 1000 ? Math.round(n).toLocaleString("en-US") : String(Math.round(n * 10) / 10);

// Bar pop timings match the default SFX in the skill (0.7, 1.0, 1.35 s).
const BAR_DELAYS = [0.7, 1.0, 1.35];

const Bars: React.FC<{ items: BarItem[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...items.map((i) => i.value), 1);
  const anyHighlight = items.some((i) => i.highlight);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 120, height: 520 }}>
      {items.map((item, i) => {
        const p = pop(frame, fps, BAR_DELAYS[i] ?? 0.7 + i * 0.35);
        const grow = Math.min(1, Math.max(0, p));
        const color = item.highlight || (!anyHighlight && i === items.length - 1) ? theme.orange : theme.lilac;
        return (
          <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 300 }}>
            <div style={{ fontFamily: theme.serif, fontWeight: 800, fontSize: 72, opacity: grow }}>
              {fmt(item.value * grow)}
            </div>
            <div
              style={{
                width: 260,
                height: (item.value / max) * 360 * p,
                background: color,
                borderRadius: "10px 10px 0 0",
                marginTop: 12,
              }}
            />
            <div style={{ fontFamily: theme.mono, fontWeight: 700, fontSize: 32, marginTop: 20, textAlign: "center" }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Lines: React.FC<{ labels: string[]; series: LineSeries[] }> = ({ labels, series }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 1500;
  const H = 440;
  const all = series.flatMap((s) => s.values);
  const min = Math.min(0, ...all);
  const max = Math.max(...all, 1);
  const x = (i: number) => (labels.length === 1 ? W / 2 : (i / (labels.length - 1)) * W);
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const draw = interpolate(frame, [0.4 * fps, 2.2 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const anyHighlight = series.some((s) => s.highlight);
  const step = Math.ceil(labels.length / 8);

  return (
    <svg width={W + 120} height={H + 140} viewBox={`-60 -70 ${W + 120} ${H + 140}`}>
      <line x1={0} x2={W} y1={H} y2={H} stroke={theme.ink} strokeWidth={3} />
      {series.map((s, si) => {
        const color = s.highlight || (!anyHighlight && si === 0) ? theme.orange : theme.lilac;
        const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
        const lastIdx = Math.max(0, Math.floor(draw * (s.values.length - 1)));
        return (
          <g key={s.name}>
            <path d={d} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            {draw > 0.98 ? (
              <text x={x(s.values.length - 1) - 16} y={y(s.values[s.values.length - 1]) - 24} textAnchor="end"
                fontFamily={theme.mono} fontWeight={700} fontSize={34} fill={theme.ink}>
                {s.name}: {fmt(s.values[lastIdx])}
              </text>
            ) : null}
          </g>
        );
      })}
      {labels.map((l, i) =>
        i % step === 0 || i === labels.length - 1 ? (
          <text key={l + i} x={x(i)} y={H + 55} textAnchor="middle" fontFamily={theme.mono} fontSize={28} fill={theme.muted}>
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
};

export const VoxChart: React.FC<{ data: VoxChartData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = ease(frame, fps, 0);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "100px 160px 190px", flexDirection: "column" }}>
        <div style={fadeUp(head)}>
          {data.unit ? <Kicker text={data.unit} /> : null}
          <div style={{ fontFamily: theme.serif, fontWeight: 800, fontSize: 84, marginTop: 10 }}>{data.title}</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          {data.mode === "bar" ? <Bars items={data.items} /> : <Lines labels={data.labels} series={data.series} />}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
