import { TrendsDashboard } from '@/widgets/trends-dashboard/ui/TrendsDashboard'
import { XMLParser } from 'fast-xml-parser'
import { TrendingSearches } from '@/widgets/trending-searches/ui/trending-searches'

async function getTrends() {
  const response = await fetch('https://trends.google.co.kr/trending/rss?geo=KR', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
    next: {
      revalidate: 60,
    },
  })

  const xmlData = await response.text()
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const result = parser.parse(xmlData)
  return result.rss.channel.item
}

export default async function Home() {
  const trends = await getTrends()

  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 lg:flex space-y-4 gap-8">
      {/*<ModeToggle />*/}

      <TrendingSearches initialData={trends} />

      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">네이버 실시간 검색어 트렌드</h1>
          <p className="text-muted-foreground mt-2">
            네이버 데이터랩 API를 활용한 검색어 트렌드 분석 대시보드
          </p>
        </div>
        <TrendsDashboard />
      </div>
    </main>
  )
}
