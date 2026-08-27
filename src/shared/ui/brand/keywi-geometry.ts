/**
 * Keywi 심볼(키위 단면)의 도형 정의 — 유일한 원본.
 *
 * 화면용 React 컴포넌트(`keywi-mark.tsx`)와 애플 아이콘 생성기(`app/apple-icon.tsx`)가
 * 모두 여기를 읽는다. `public/brand/*.svg`와 `app/icon.svg`는 이 값으로 뽑아낸 산출물이라
 * 도형을 고치면 함께 다시 만들어야 한다.
 *
 * 좌표계는 64×64. 씨앗을 중심 가까이 촘촘한 고리로 두는 게 핵심이다 —
 * 멀리 벌리면 키위가 아니라 로딩 스피너로 읽힌다.
 */
export const KEYWI_COLORS = {
  skinFrom: '#74A62B',
  skinTo: '#4E7A1E',
  flesh: '#B7D96D',
  striation: '#D9EDA8',
  seed: '#2E2A18',
  core: '#FDF8E8',
} as const

const STRIATION_COUNT = 14
const SEED_COUNT = 11

/** 과육의 결 — 중심에서 바깥으로 뻗는 옅은 줄 */
export const KEYWI_STRIATIONS = Array.from({ length: STRIATION_COUNT }, (_, i) => {
  const angle = (i * 2 * Math.PI) / STRIATION_COUNT
  const at = (radius: number) => ({
    x: +(32 + radius * Math.sin(angle)).toFixed(2),
    y: +(32 - radius * Math.cos(angle)).toFixed(2),
  })
  const inner = at(9.5)
  const outer = at(21.5)
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }
})

/** 씨앗의 회전각(도). 심 바로 바깥에 고리로 배치된다 */
export const KEYWI_SEEDS = Array.from(
  { length: SEED_COUNT },
  (_, i) => +((i * 360) / SEED_COUNT).toFixed(1)
)
