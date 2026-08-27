import {
  KEYWI_BASELINE,
  KEYWI_COLORS,
  KEYWI_DOME,
  KEYWI_HORIZON,
  KEYWI_PIVOT,
  KEYWI_SEED_RADIUS,
  KEYWI_SEEDS,
  KEYWI_STRIATION_BAND,
  KEYWI_STRIATIONS,
} from './keywi-geometry'

export function KeywiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-hidden focusable="false">
      <rect width="64" height="64" rx="15" fill={KEYWI_COLORS.green} />
      <path d={KEYWI_DOME} fill={KEYWI_COLORS.light} />
      {KEYWI_STRIATIONS.map((angle) => (
        <line
          key={`s${angle}`}
          x1="32"
          y1={KEYWI_HORIZON - KEYWI_STRIATION_BAND.inner}
          x2="32"
          y2={KEYWI_HORIZON - KEYWI_STRIATION_BAND.outer}
          stroke={KEYWI_COLORS.green}
          strokeWidth="1.7"
          strokeLinecap="round"
          transform={`rotate(${angle} ${KEYWI_PIVOT})`}
        />
      ))}
      {KEYWI_SEEDS.map((angle) => (
        <ellipse
          key={`d${angle}`}
          cx="32"
          cy={KEYWI_HORIZON - KEYWI_SEED_RADIUS}
          rx="1.4"
          ry="2.2"
          fill={KEYWI_COLORS.green}
          transform={`rotate(${angle} ${KEYWI_PIVOT})`}
        />
      ))}
      <line
        x1={KEYWI_BASELINE.x1}
        y1={KEYWI_BASELINE.y}
        x2={KEYWI_BASELINE.x2}
        y2={KEYWI_BASELINE.y}
        stroke={KEYWI_COLORS.light}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
