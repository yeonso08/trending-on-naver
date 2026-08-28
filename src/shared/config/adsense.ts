/**
 * AdSense 설정.
 *
 * 게시자 ID는 심사를 신청해야 발급되므로 코드에 박지 않고 환경 변수로 받습니다.
 * ID가 없으면 스크립트도 지면도 렌더하지 않습니다 — 빈 상자가 페이지에 남으면
 * 심사에서 미완성으로 보일 수 있습니다.
 *
 * Vercel 프로젝트 설정과 `.env.local` 양쪽에 넣어야 합니다.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
 *
 * 광고 단위(slot) ID는 승인 후 AdSense 콘솔에서 지면별로 만들어 아래에 채웁니다.
 * client만 있고 slot이 비어 있으면 해당 지면은 렌더하지 않습니다.
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? ''

/** `ca-pub-`으로 시작하는 값이 들어와야 유효한 것으로 본다 */
export const ADSENSE_ENABLED = ADSENSE_CLIENT.startsWith('ca-pub-')

export type AdFormat = 'leaderboard' | 'rectangle' | 'in-feed'

/** 승인 후 AdSense 콘솔에서 만든 광고 단위 ID를 채워 넣을 것 */
export const ADSENSE_SLOTS: Record<AdFormat, string> = {
  leaderboard: '',
  rectangle: '',
  'in-feed': '',
}
