import {
  KEYWI_BASELINE,
  KEYWI_DOME,
  KEYWI_HORIZON,
  KEYWI_PALETTES,
  KEYWI_PIVOT,
  KEYWI_SEEDS,
  KEYWI_STRIATIONS,
  KEYWI_TILE,
} from './keywi-geometry'

type Variant = keyof typeof KEYWI_PALETTES

/**
 * Keywi 심볼.
 * `onTile`(기본)은 브랜드 그린 타일 안에, `onLight`는 밝은 배경 위에 심볼만 놓는다.
 */
export function KeywiMark({
  className,
  variant = 'onTile',
}: {
  className?: string
  variant?: Variant
}) {
  const palette = KEYWI_PALETTES[variant]

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-hidden focusable="false">
      {variant === 'onTile' && <rect width="64" height="64" rx="15" fill={KEYWI_TILE} />}
      <path d={KEYWI_DOME} fill={palette.flesh} />
      {KEYWI_STRIATIONS.angles.map((angle) => (
        <line
          key={`s${angle}`}
          x1="32"
          y1={KEYWI_HORIZON - KEYWI_STRIATIONS.inner}
          x2="32"
          y2={KEYWI_HORIZON - KEYWI_STRIATIONS.outer}
          stroke={palette.striation}
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
          fill={palette.ink}
          transform={`rotate(${angle} ${KEYWI_PIVOT})`}
        />
      ))}
      <line
        x1={KEYWI_BASELINE.x1}
        y1={KEYWI_BASELINE.y}
        x2={KEYWI_BASELINE.x2}
        y2={KEYWI_BASELINE.y}
        stroke={palette.ink}
        strokeWidth={KEYWI_BASELINE.width}
        strokeLinecap="round"
      />
    </svg>
  )
}
