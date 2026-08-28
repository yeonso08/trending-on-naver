import { ImageResponse } from 'next/og'

import { getTrendingTopicByKeyword } from '@/entities/trending/api/get-trending-topics'
import { SITE } from '@/shared/config/site'
import {
  keywiMarkDataUri,
  loadOgFonts,
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from '@/shared/model/og'

export const alt = '실시간 검색어 상세'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** 검색어가 길어지면 줄바꿈보다 먼저 크기를 줄인다. 두 줄까지는 허용한다 */
function keywordFontSize(keyword: string) {
  if (keyword.length <= 7) return 108
  if (keyword.length <= 12) return 86
  if (keyword.length <= 20) return 66
  return 52
}

export default async function KeywordOpengraphImage({
  params,
}: {
  params: Promise<{ keyword: string }>
}) {
  const [{ keyword: rawKeyword }, fonts] = await Promise.all([params, loadOgFonts()])
  const keyword = decodeURIComponent(rawKeyword)
  const topic = await getTrendingTopicByKeyword(keyword)

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '72px 96px',
        background: OG_COLORS.surface,
        fontFamily: 'Pretendard',
        position: 'relative',
      }}
    >
      {}
      <img
        src={keywiMarkDataUri(11)}
        width={704}
        height={704}
        alt=""
        style={{ position: 'absolute', right: -230, bottom: -300, opacity: 0.3 }}
      />

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {}
        <img src={keywiMarkDataUri(0.85)} width={54} height={54} alt="" />
        <span
          style={{
            marginLeft: 15,
            fontSize: 31,
            fontWeight: 700,
            letterSpacing: -1.2,
            color: OG_COLORS.ink,
          }}
        >
          {SITE.name}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {topic ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'flex',
                padding: '9px 22px',
                borderRadius: 999,
                background: OG_COLORS.heat,
                color: '#FFFFFF',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.6,
              }}
            >
              실시간 {topic.rank}위
            </span>
            {topic.approxTraffic ? (
              <span style={{ marginLeft: 18, fontSize: 27, color: OG_COLORS.muted }}>
                검색량 {topic.approxTraffic}
              </span>
            ) : null}
          </div>
        ) : (
          <span style={{ fontSize: 27, color: OG_COLORS.muted }}>실시간 인기 검색어</span>
        )}

        <div
          style={{
            marginTop: 24,
            fontSize: keywordFontSize(keyword),
            fontWeight: 700,
            letterSpacing: -3.6,
            lineHeight: 1.14,
            color: OG_COLORS.ink,
          }}
        >
          {keyword}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 26, color: OG_COLORS.muted }}>관련 뉴스와 30일 검색량 추이</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.4,
            color: OG_COLORS.brand,
          }}
        >
          keywi.kr
        </span>
      </div>
    </div>,
    { ...size, fonts }
  )
}
