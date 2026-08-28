import type { Metadata } from 'next'
import './fonts.css'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
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
