// Pure-SVG candlestick renderer — no chart library dependency, so it's safe
// to deploy without any extra npm install step.
export default function CandlestickChart({ bars, height = 220 }) {
  if (!bars || !bars.length) return null;

  const width = 600;
  const padding = 10;
  const highs = bars.map((b) => b.h);
  const lows = bars.map((b) => b.l);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;

  const chartH = height - padding * 2;
  const slotW = (width - padding * 2) / bars.length;
  const bodyW = Math.max(2, slotW * 0.6);

  function y(v) {
    return padding + chartH - ((v - min) / range) * chartH;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label="candlestick chart">
      {bars.map((b, i) => {
        const cx = padding + i * slotW + slotW / 2;
        const isUp = b.c >= b.o;
        const color = isUp ? 'var(--green)' : 'var(--red)';
        const bodyTop = y(Math.max(b.o, b.c));
        const bodyBottom = y(Math.min(b.o, b.c));
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(b.h)} y2={y(b.l)} stroke={color} strokeWidth={1} />
            <rect
              x={cx - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={Math.max(1, bodyBottom - bodyTop)}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}
