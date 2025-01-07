import { TrendsDashboard } from '@/widgets/trends-dashboard/ui/TrendsDashboard';

export default function Home() {
    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>네이버 실시간 검색어 트렌드</h1>
            <TrendsDashboard />
        </main>
    );
}