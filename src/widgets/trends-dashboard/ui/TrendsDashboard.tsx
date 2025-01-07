'use client';

import { TrendChart } from '@/features/trend-analysis/ui/TrendChart';
import { useTrendData } from '@/features/trend-analysis/model/use-trend-data';

export function TrendsDashboard() {
    const { trends, loading, error } = useTrendData();

    console.log('Dashboard trends:', trends);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <TrendChart data={trends} />
        </div>
    );
}