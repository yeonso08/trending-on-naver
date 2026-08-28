import { ImageResponse } from 'next/og'

import { SITE } from '@/shared/config/site'
import {
  keywiMarkDataUri,
  loadOgFonts,
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from '@/shared/model/og'

export const alt = `${SITE.name} — ${SITE.tagline}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OpengraphImage() {
  const fonts = await loadOgFonts()

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '0 96px',
        background: OG_COLORS.surface,
        fontFamily: 'Pretendard',
        position: 'relative',
      }}
    >
      {/* 로고의 반원을 크게 깔아 브랜드를 잇는다. 잘려 나가도 형태가 읽힌다 */}
      {}
      <img
        src={keywiMarkDataUri(11)}
        width={704}
        height={704}
        alt=""
        style={{ position: 'absolute', right: -210, bottom: -285, opacity: 0.34 }}
      />

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {}
        <img src={keywiMarkDataUri(1.1)} width={70} height={70} alt="" />
        <span
          style={{
            marginLeft: 18,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -1.5,
            color: OG_COLORS.ink,
          }}
        >
          {SITE.name}
        </span>
      </div>

      <div
        style={{
          marginTop: 34,
          fontSize: 78,
          fontWeight: 700,
          letterSpacing: -3.4,
          lineHeight: 1.18,
          color: OG_COLORS.ink,
        }}
      >
        {SITE.tagline}
      </div>

      <div style={{ marginTop: 26, fontSize: 30, color: OG_COLORS.muted }}>
        실시간 인기 검색어 순위와 검색량 추이를 한 곳에서
      </div>

      <div
        style={{
          marginTop: 46,
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: -0.4,
          color: OG_COLORS.brand,
        }}
      >
        keywi.kr
      </div>
    </div>,
    { ...size, fonts }
  )
}
