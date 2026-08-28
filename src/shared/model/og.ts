import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import {
  KEYWI_BASELINE,
  KEYWI_DOME,
  KEYWI_HORIZON,
  KEYWI_PIVOT,
  KEYWI_SEEDS,
  KEYWI_STATIC,
  KEYWI_STRIATIONS,
  KEYWI_VIEWBOX,
} from '@/shared/ui/brand/keywi-geometry'

/**
 * OG 이미지 공용 설정.
 *
 * ⚠️ `ImageResponse`(satori)는 **woff2를 읽지 못합니다.** 화면용으로 쓰는
 * `public/fonts/pretendard/`의 동적 서브셋 92개는 전부 woff2라 여기서는 쓸 수 없어,
 * OG 전용으로 통짜 woff 두 벌을 따로 둡니다. 서버에서만 읽히고 브라우저로는 나가지 않습니다.
 * 한글을 그리려면 반드시 이 폰트를 넘겨야 하고, 안 넘기면 글자가 전부 두부(□□□)가 됩니다.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export const OG_COLORS = {
  surface: '#FDFCFB',
  ink: '#171312',
  muted: '#7A736E',
  line: '#E8E5E1',
  brand: '#6AA329',
  heat: '#F95610',
} as const

const FONT_DIR = join(process.cwd(), 'public', 'fonts', 'pretendard', 'og')

/** satori에 넘길 폰트 두 벌. 라우트마다 매번 읽지 않도록 모듈 수준에서 한 번만 만든다 */
let fontsPromise: Promise<
  Array<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }>
> | null = null

export function loadOgFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(FONT_DIR, 'Pretendard-Regular.woff')),
    readFile(join(FONT_DIR, 'Pretendard-Bold.woff')),
  ]).then(([regular, bold]) => [
    { name: 'Pretendard', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Pretendard', data: bold, weight: 700 as const, style: 'normal' as const },
  ])

  return fontsPromise
}

/**
 * 로고 심볼을 data URI로. satori는 인라인 SVG 대신 <img>를 안정적으로 다루므로
 * 화면용 컴포넌트를 재사용하지 않고 같은 기하 상수로 문자열을 만든다.
 */
export function keywiMarkDataUri(scale = 1) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${KEYWI_VIEWBOX}" width="${64 * scale}" height="${64 * scale}">
  <path d="${KEYWI_DOME}" fill="${KEYWI_STATIC.flesh}"/>
  ${KEYWI_STRIATIONS.angles
    .map(
      (a) =>
        `<line x1="32" y1="${KEYWI_HORIZON - KEYWI_STRIATIONS.inner}" x2="32" y2="${KEYWI_HORIZON - KEYWI_STRIATIONS.outer}" stroke="${KEYWI_STATIC.striation}" stroke-width="${KEYWI_STRIATIONS.width}" stroke-linecap="round" transform="rotate(${a} ${KEYWI_PIVOT})"/>`
    )
    .join('')}
  ${KEYWI_SEEDS.angles
    .map(
      (a) =>
        `<ellipse cx="32" cy="${KEYWI_HORIZON - KEYWI_SEEDS.radius}" rx="${KEYWI_SEEDS.rx}" ry="${KEYWI_SEEDS.ry}" fill="${KEYWI_STATIC.ink}" transform="rotate(${a} ${KEYWI_PIVOT})"/>`
    )
    .join('')}
  <line x1="${KEYWI_BASELINE.x1}" y1="${KEYWI_BASELINE.y}" x2="${KEYWI_BASELINE.x2}" y2="${KEYWI_BASELINE.y}" stroke="${KEYWI_STATIC.ink}" stroke-width="${KEYWI_BASELINE.width}" stroke-linecap="round"/>
</svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
