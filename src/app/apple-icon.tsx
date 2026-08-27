import { ImageResponse } from 'next/og'

import {
  KEYWI_BASELINE,
  KEYWI_DOME,
  KEYWI_HORIZON,
  KEYWI_PALETTES,
  KEYWI_PIVOT,
  KEYWI_SEEDS,
  KEYWI_STRIATIONS,
  KEYWI_TILE,
} from '@/shared/ui/brand/keywi-geometry'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const p = KEYWI_PALETTES.onTile

/**
 * iOS가 모서리를 알아서 둥글리므로 여기서는 모서리를 주지 않는다(rx 없음).
 * 투명 배경도 iOS에서는 검게 깔리므로 꽉 찬 사각형으로 그린다.
 */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size.width}" height="${size.height}">
  <rect width="64" height="64" fill="${KEYWI_TILE}"/>
  <path d="${KEYWI_DOME}" fill="${p.flesh}"/>
  ${KEYWI_STRIATIONS.angles
    .map(
      (a) =>
        `<line x1="32" y1="${KEYWI_HORIZON - KEYWI_STRIATIONS.inner}" x2="32" y2="${KEYWI_HORIZON - KEYWI_STRIATIONS.outer}" stroke="${p.striation}" stroke-width="${KEYWI_STRIATIONS.width}" stroke-linecap="round" transform="rotate(${a} ${KEYWI_PIVOT})"/>`
    )
    .join('')}
  ${KEYWI_SEEDS.angles
    .map(
      (a) =>
        `<ellipse cx="32" cy="${KEYWI_HORIZON - KEYWI_SEEDS.radius}" rx="${KEYWI_SEEDS.rx}" ry="${KEYWI_SEEDS.ry}" fill="${p.ink}" transform="rotate(${a} ${KEYWI_PIVOT})"/>`
    )
    .join('')}
  <line x1="${KEYWI_BASELINE.x1}" y1="${KEYWI_BASELINE.y}" x2="${KEYWI_BASELINE.x2}" y2="${KEYWI_BASELINE.y}" stroke="${p.ink}" stroke-width="${KEYWI_BASELINE.width}" stroke-linecap="round"/>
</svg>`

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      { }
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
