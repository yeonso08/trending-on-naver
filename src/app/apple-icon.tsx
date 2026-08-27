import { ImageResponse } from 'next/og'

import { KEYWI_COLORS, KEYWI_SEEDS, KEYWI_STRIATIONS } from '@/shared/ui/brand/keywi-geometry'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * iOS가 모서리를 알아서 둥글리므로 여기서는 모서리를 주지 않는다(rx 없음).
 * 투명 배경도 iOS에서는 검게 깔리므로 꽉 찬 사각형으로 그린다.
 */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size.width}" height="${size.height}">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${KEYWI_COLORS.skinFrom}"/><stop offset="1" stop-color="${KEYWI_COLORS.skinTo}"/></linearGradient></defs>
  <rect width="64" height="64" fill="url(#s)"/>
  <circle cx="32" cy="32" r="22.5" fill="${KEYWI_COLORS.flesh}"/>
  ${KEYWI_STRIATIONS.map(
    (l) =>
      `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${KEYWI_COLORS.striation}" stroke-width="1.15" stroke-linecap="round"/>`
  ).join('')}
  ${KEYWI_SEEDS.map(
    (a) =>
      `<ellipse cx="32" cy="21.3" rx="1.15" ry="1.95" fill="${KEYWI_COLORS.seed}" transform="rotate(${a} 32 32)"/>`
  ).join('')}
  <ellipse cx="32" cy="32" rx="4.7" ry="5.5" fill="${KEYWI_COLORS.core}"/>
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
