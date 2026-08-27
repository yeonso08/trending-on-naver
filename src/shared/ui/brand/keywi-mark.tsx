import {
  KEYWI_BASELINE,
  KEYWI_DOME,
  KEYWI_HORIZON,
  KEYWI_PIVOT,
  KEYWI_SEEDS,
  KEYWI_STRIATIONS,
  KEYWI_TOKENS,
  KEYWI_VIEWBOX,
} from './keywi-geometry'

/** Keywi 심볼. 배경 타일 없이 심볼만 그린다 — 색은 테마 토큰을 따라간다 */
export function KeywiMark({ className }: { className?: string }) {
  return (
    <svg viewBox={KEYWI_VIEWBOX} className={className} role="img" aria-hidden focusable="false">
      <path d={KEYWI_DOME} fill={KEYWI_TOKENS.flesh} />
      {KEYWI_STRIATIONS.angles.map((angle) => (
        <line
          key={`s${angle}`}
          x1="32"
          y1={KEYWI_HORIZON - KEYWI_STRIATIONS.inner}
          x2="32"
          y2={KEYWI_HORIZON - KEYWI_STRIATIONS.outer}
          stroke={KEYWI_TOKENS.striation}
          strokeWidth={KEYWI_STRIATIONS.width}
          strokeLinecap="round"
          transform={`rotate(${angle} ${KEYWI_PIVOT})`}
        />
      ))}
      {KEYWI_SEEDS.angles.map((angle) => (
        <ellipse
          key={`d${angle}`}
          cx="32"
          cy={KEYWI_HORIZON - KEYWI_SEEDS.radius}
          rx={KEYWI_SEEDS.rx}
          ry={KEYWI_SEEDS.ry}
          fill={KEYWI_TOKENS.ink}
          transform={`rotate(${angle} ${KEYWI_PIVOT})`}
        />
      ))}
      <line
        x1={KEYWI_BASELINE.x1}
        y1={KEYWI_BASELINE.y}
        x2={KEYWI_BASELINE.x2}
        y2={KEYWI_BASELINE.y}
        stroke={KEYWI_TOKENS.ink}
        strokeWidth={KEYWI_BASELINE.width}
        strokeLinecap="round"
      />
    </svg>
  )
}
