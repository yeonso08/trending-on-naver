import { ImageResponse } from 'next/og'

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
} from '@/shared/ui/brand/keywi-geometry'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * iOS가 모서리를 알아서 둥글리므로 여기서는 모서리를 주지 않는다(rx 없음).
 * 투명 배경도 iOS에서는 검게 깔리므로 꽉 찬 사각형으로 그린다.
 */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size.width}" height="${size.height}">
  <rect width="64" height="64" fill="${KEYWI_COLORS.green}"/>
  <path d="${KEYWI_DOME}" fill="${KEYWI_COLORS.light}"/>
  ${KEYWI_STRIATIONS.map(
    (a) =>
      `<line x1="32" y1="${KEYWI_HORIZON - KEYWI_STRIATION_BAND.inner}" x2="32" y2="${KEYWI_HORIZON - KEYWI_STRIATION_BAND.outer}" stroke="${KEYWI_COLORS.green}" stroke-width="1.7" stroke-linecap="round" transform="rotate(${a} ${KEYWI_PIVOT})"/>`
  ).join('')}
  ${KEYWI_SEEDS.map(
    (a) =>
      `<ellipse cx="32" cy="${KEYWI_HORIZON - KEYWI_SEED_RADIUS}" rx="1.4" ry="2.2" fill="${KEYWI_COLORS.green}" transform="rotate(${a} ${KEYWI_PIVOT})"/>`
  ).join('')}
  <line x1="${KEYWI_BASELINE.x1}" y1="${KEYWI_BASELINE.y}" x2="${KEYWI_BASELINE.x2}" y2="${KEYWI_BASELINE.y}" stroke="${KEYWI_COLORS.light}" stroke-width="3" stroke-linecap="round"/>
</svg>`

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
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
