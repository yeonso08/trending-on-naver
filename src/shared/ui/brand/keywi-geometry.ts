/**
 * Keywi 심볼(반단면)의 도형 정의 — 유일한 원본.
 *
 * 화면용 React 컴포넌트(`keywi-mark.tsx`)와 애플 아이콘 생성기(`app/apple-icon.tsx`)가
 * 모두 여기를 읽는다. `public/brand/*.svg`와 `app/icon.svg`는 이 값으로 뽑아낸 산출물이라
 * 도형을 고치면 함께 다시 만들어야 한다.
 *
 * 좌표계는 64×64. 지평선 위로 떠오른 반단면이다 — 키위 단면이면서 부채꼴 차트로 읽힌다.
 * 과육 · 부챗살 · 씨앗이 톤을 달리하는 세 겹 구조이고, 이 톤 차이가 이 심볼의 인상을
 * 만든다. 두 가지 색으로 줄여 네거티브로 파내 본 적이 있는데 훨씬 딱딱해져서 되돌렸다.
 * 선을 굵게 하거나 층을 줄이지 말 것.
 *
 * 배경 타일(둥근 초록 사각형)은 걷어냈다. 심볼만 배경 위에 얹는다.
 */

/**
 * 타일이 없으므로 심볼이 배경 위에서 직접 버텨야 한다.
 * 화면에서는 CSS 토큰을 써서 다크 모드를 따라가고, 정적 자산은 아래 리터럴을 쓴다.
 */
export const KEYWI_TOKENS = {
  flesh: 'hsl(var(--brand-flesh))',
  striation: 'hsl(var(--brand) / 0.42)',
  ink: 'hsl(var(--brand))',
} as const

/** 정적 SVG·PNG용 리터럴. 화면 토큰의 라이트 모드 값과 같다 */
export const KEYWI_STATIC = {
  flesh: '#EAF3D9',
  striation: 'rgba(106, 163, 41, 0.42)',
  ink: '#6AA329',
} as const

/** 다크 배경에 얹는 정적 자산용 */
export const KEYWI_STATIC_DARK = {
  flesh: '#33421F',
  striation: 'rgba(139, 199, 74, 0.42)',
  ink: '#8BC74A',
} as const

/**
 * 타일을 걷어내면 심볼이 사각형 안에서 작아 보인다.
 * 여백을 줄인 뷰박스로 시각적 크기를 되찾는다.
 */
export const KEYWI_VIEWBOX = '4 3 56 56'

/** 지평선의 y좌표. 반원은 이 선 위에 얹힌다 */
export const KEYWI_HORIZON = 42
export const KEYWI_RADIUS = 24

/** 반원의 외곽선 — 지평선 왼쪽 끝에서 시계방향으로 그린다 */
export const KEYWI_DOME = `M${32 - KEYWI_RADIUS} ${KEYWI_HORIZON} A${KEYWI_RADIUS} ${KEYWI_RADIUS} 0 0 1 ${32 + KEYWI_RADIUS} ${KEYWI_HORIZON} Z`

/** 지평선은 반원보다 양옆으로 조금 더 나간다 — 그래야 '수평선'으로 읽힌다 */
export const KEYWI_BASELINE = { x1: 6, x2: 58, y: KEYWI_HORIZON, width: 2.6 }

/** 과육의 결 — 중심에서 바깥으로 뻗는 부챗살 */
export const KEYWI_STRIATIONS = {
  angles: [-72, -48, -24, 0, 24, 48, 72],
  inner: 9,
  outer: 21,
  width: 1.5,
}

/** 씨앗 — 부챗살과 같은 대역에 겹쳐 앉으면서 결 사이를 채운다 */
export const KEYWI_SEEDS = {
  angles: [-60, -30, 0, 30, 60],
  radius: 12.5,
  rx: 1.8,
  ry: 2.9,
}

/** 부챗살·씨앗을 지평선 중심 기준으로 회전시킨다 */
export const KEYWI_PIVOT = `32 ${KEYWI_HORIZON}`
