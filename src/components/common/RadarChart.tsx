import React from 'react';

export interface RadarDataPoint {
  dimension: string;
  value: number; // 0 to 100
  userValue?: number; // 0 to 100 for comparison
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  showComparison?: boolean;
  centerText?: string;
  interactive?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 380,
  showComparison = true,
  centerText = 'Your Cinematic DNA',
}) => {
  const numDimensions = data.length;
  const radius = size * 0.36;
  const center = size / 2;

  // Concentric polygon grid levels
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const safeVal = (v: number | undefined, fallback = 50) => {
    if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) return fallback;
    return Math.max(0, Math.min(100, Math.round(v)));
  };

  const getCoordinates = (index: number, val: number, maxRadius: number = radius) => {
    // Angle in radians, offset so first point is top (angle = -PI/2)
    const angle = (Math.PI * 2 * index) / (numDimensions || 1) - Math.PI / 2;
    const r = (safeVal(val) / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate web background polygons
  const gridPolygons = levels.map((level) => {
    const points = data
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level * 100);
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  // Movie DNA polygon points
  const moviePolygonPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.value);
      return `${x},${y}`;
    })
    .join(' ');

  // User comparison polygon points
  const userPolygonPoints = data
    .map((d, i) => {
      const val = d.userValue ?? 75;
      const { x, y } = getCoordinates(i, val);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex items-center justify-center select-none w-full max-w-[420px] mx-auto aspect-square">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full drop-shadow-[0_0_20px_rgba(255,42,95,0.15)]"
      >
        <defs>
          {/* Radial glow gradient */}
          <radialGradient id="radarBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff2a5f" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#ff2a5f" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#ff2a5f" stopOpacity="0" />
          </radialGradient>

          {/* Movie DNA gradient fill */}
          <linearGradient id="moviePolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a5f" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d80032" stopOpacity="0.25" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx={center} cy={center} r={radius * 1.05} fill="url(#radarBgGlow)" />

        {/* Concentric grid polygons */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={idx === levels.length - 1 ? '1.5' : '1'}
            strokeDasharray={idx === levels.length - 1 ? undefined : '2,3'}
          />
        ))}

        {/* Radial axis lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.09)"
              strokeWidth="1"
            />
          );
        })}

        {/* User Comparison DNA Polygon (if enabled) */}
        {showComparison && (
          <polygon
            points={userPolygonPoints}
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            className="opacity-60"
          />
        )}

        {/* Primary Movie DNA Polygon */}
        <polygon
          points={moviePolygonPoints}
          fill="url(#moviePolyGrad)"
          stroke="#ff2a5f"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Data Points on vertices */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, d.value);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#ffffff"
                stroke="#ff2a5f"
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="none"
                stroke="#ff2a5f"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Labels positioned around the periphery */}
        {data.map((d, i) => {
          const labelCoord = getCoordinates(i, 122, radius);
          const isTop = labelCoord.y < center - 20;
          const isBottom = labelCoord.y > center + 20;
          const textAnchor =
            Math.abs(labelCoord.x - center) < 15
              ? 'middle'
              : labelCoord.x > center
              ? 'start'
              : 'end';

          return (
            <g key={i} transform={`translate(${labelCoord.x}, ${labelCoord.y})`}>
              <text
                textAnchor={textAnchor}
                dy={isTop ? '-0.2em' : isBottom ? '0.9em' : '0.3em'}
                className="text-[11px] font-semibold fill-slate-300 tracking-tight"
              >
                {d.dimension}
              </text>
              <text
                textAnchor={textAnchor}
                dy={isTop ? '0.9em' : isBottom ? '1.9em' : '1.3em'}
                className="text-[11px] font-bold fill-[#ff2a5f] tabular-nums"
              >
                {d.value}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center Badge if desired */}
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-[#11131a]/85 border border-[#ff2a5f]/30 backdrop-blur-md shadow-lg">
            <span className="text-[10px] font-bold text-white tracking-wider uppercase block text-center">
              {centerText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
