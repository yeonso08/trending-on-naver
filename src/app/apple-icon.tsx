import { ImageResponse } from 'next/og'

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

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * 다른 자산과 달리 여기만 배경을 깐다. iOS는 투명 픽셀을 검게 칠하므로
 * 배경 없는 애플 아이콘은 검은 사각형이 된다. 초록 타일 대신 앱의 표면색을 쓴다.
 */
const SURFACE = '#FDFCFB'

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${KEYWI_VIEWBOX}" width="${size.width}" height="${size.height}">
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

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: SURFACE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {}
      <img
        width={size.width}
        height={size.height}
        src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`}
        alt=""
      />
    </div>,
    size
  )
}
