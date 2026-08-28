import type { Metadata } from 'next'
import './fonts.css'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from '@/shared/config/adsense'
import { SITE } from '@/shared/config/site'
import { SiteFooter } from '@/widgets/site-footer/ui/site-footer'
import { SiteHeader } from '@/widgets/site-header/ui/site-header'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  // 구글은 DNS TXT 레코드로 인증했으므로 태그가 필요 없다. 네이버만 태그로 받는다.
  verification: {
    other: { 'naver-site-verification': '2999f272212b1fb92fe6d6b1de48ceb792327c50' },
  },
}

/**
 * Pretendard 동적 서브셋 중 사용 빈도가 가장 높은 3개.
 * 한글 페이지에서는 사실상 항상 필요하므로 미리 받아 FOUT을 줄인다.
 */
const PRELOADED_FONT_SUBSETS = [91, 90, 89]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/*
          게시자 ID가 없으면 넣지 않는다. 심사 신청 후 Vercel 환경 변수에 채우면 붙는다.

          next/script의 afterInteractive를 쓰면 <head>에는 preload 링크만 남고 실제
          <script>는 하이드레이션 후 JS로 주입된다. 구글은 스니펫을 <head>에 두라고
          안내하므로, 서버 HTML에 태그가 그대로 찍히도록 평범한 script를 쓴다.
        */}
        {ADSENSE_ENABLED && (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
        {PRELOADED_FONT_SUBSETS.map((index) => (
          <link
            key={index}
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href={`/fonts/pretendard/PretendardVariable.subset.${index}.woff2`}
          />
        ))}
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
