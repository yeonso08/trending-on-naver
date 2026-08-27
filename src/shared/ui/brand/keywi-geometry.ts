/**
 * Keywi 심볼(반단면)의 도형 정의 — 유일한 원본.
 *
 * 화면용 React 컴포넌트(`keywi-mark.tsx`)와 애플 아이콘 생성기(`app/apple-icon.tsx`)가
 * 모두 여기를 읽는다. `public/brand/*.svg`와 `app/icon.svg`는 이 값으로 뽑아낸 산출물이라
 * 도형을 고치면 함께 다시 만들어야 한다.
 *
 * 좌표계는 64×64. 지평선 위로 떠오른 반단면이다 — 키위 단면이면서 부채꼴 차트로 읽힌다.
 * 색은 브랜드 그린과 흰색 둘뿐이고, 결과 씨앗은 흰 반원에서 파낸 네거티브다.
 * 과육색을 따로 칠하면 곧장 과일 일러스트로 내려앉는다.
 */
export const KEYWI_COLORS = {
  green: '#6AA329',
  light: '#FFFFFF',
} as const

/** 지평선의 y좌표. 반원은 이 선 위에 얹힌다 */
export const KEYWI_HORIZON = 42
export const KEYWI_RADIUS = 23

/** 반원의 외곽선 — 지평선 왼쪽 끝에서 시계방향으로 그린다 */
export const KEYWI_DOME = `M${32 - KEYWI_RADIUS} ${KEYWI_HORIZON} A${KEYWI_RADIUS} ${KEYWI_RADIUS} 0 0 1 ${32 + KEYWI_RADIUS} ${KEYWI_HORIZON} Z`

/** 지평선은 반원보다 양옆으로 조금 더 나간다 — 그래야 '수평선'으로 읽힌다 */
export const KEYWI_BASELINE = { x1: 6, x2: 58, y: KEYWI_HORIZON }

/**
 * 과육의 결. 바깥 띠에만 둔다.
 * 씨앗과 반경이 겹치면 두 층이 뭉개져 하나의 지저분한 햇살로 읽힌다.
 */
export const KEYWI_STRIATIONS = [-66, -33, 0, 33, 66]

/** 씨앗. 결보다 안쪽 띠에, 결 사이사이로 각을 어긋나게 둔다 */
export const KEYWI_SEEDS = [-49.5, -16.5, 16.5, 49.5]

/** 결이 걸리는 안팎 반경, 씨앗이 앉는 반경 */
export const KEYWI_STRIATION_BAND = { inner: 12.5, outer: 20.5 }
export const KEYWI_SEED_RADIUS = 8

/** 부챗살·씨앗을 지평선 중심 기준으로 회전시킨다 */
export const KEYWI_PIVOT = `32 ${KEYWI_HORIZON}`
