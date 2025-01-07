import { ModeToggle } from '@/components/mode-toggle'
import { TrendsDashboard } from '@/widgets/trends-dashboard/ui/TrendsDashboard'

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">네이버 실시간 검색어 트렌드</h1>
          <p className="text-muted-foreground mt-2">
            네이버 데이터랩 API를 활용한 검색어 트렌드 분석 대시보드
          </p>
        </div>
        <ModeToggle />
      </div>
      <TrendsDashboard />
    </main>
  )
}
