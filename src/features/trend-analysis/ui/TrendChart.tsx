'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendData } from '@/shared/types/trends';

interface TrendChartProps {
    data: TrendData[];
}

export function TrendChart({ data }: TrendChartProps) {
    console.log('TrendChart data:', data);

    if (!data || data.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div style={{ width: '100%', height: 400 }}>
            <LineChart
                width={800}
                height={400}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="#8884d8"
                />
            </LineChart>
        </div>
    );
}