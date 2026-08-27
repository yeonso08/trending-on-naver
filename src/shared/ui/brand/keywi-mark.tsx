import { KEYWI_COLORS, KEYWI_SEEDS, KEYWI_STRIATIONS } from './keywi-geometry'

/**
 * Keywi 심볼. 그라디언트 id는 고정값이다 —
 * 한 페이지에 여러 번 렌더돼도 정의가 같으므로 중복이 문제되지 않는다.
 */
export function KeywiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-hidden focusable="false">
      <defs>
        <linearGradient id="keywiSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={KEYWI_COLORS.skinFrom} />
          <stop offset="1" stopColor={KEYWI_COLORS.skinTo} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#keywiSkin)" />
      <circle cx="32" cy="32" r="22.5" fill={KEYWI_COLORS.flesh} />
      {KEYWI_STRIATIONS.map((line) => (
        <line
          key={`${line.x1}-${line.y1}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={KEYWI_COLORS.striation}
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      ))}
      {KEYWI_SEEDS.map((angle) => (
        <ellipse
          key={angle}
          cx="32"
          cy="21.3"
          rx="1.15"
          ry="1.95"
          fill={KEYWI_COLORS.seed}
          transform={`rotate(${angle} 32 32)`}
        />
      ))}
      <ellipse cx="32" cy="32" rx="4.7" ry="5.5" fill={KEYWI_COLORS.core} />
    </svg>
  )
}
