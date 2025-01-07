'use client';

import { useState, useEffect } from 'react';
import { TrendData } from '@/shared/types/trends';

export function useTrendData() {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/trends');
                const data = await response.json();
                console.log('API response:', data);

                if (data && data.results && data.results[0]?.data) {
                    setTrends(data.results[0].data);
                } else {
                    throw new Error('Invalid data structure');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { trends, loading, error };
}
