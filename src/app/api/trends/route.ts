import { NextResponse } from 'next/server';
import axios from 'axios';
import {NaverTrendResponse} from "@/shared/types/trends";

export async function GET() {
    try {
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 1);

        const requestBody = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: currentDate.toISOString().split('T')[0],
            timeUnit: 'date',
            keywordGroups: [
                {
                    groupName: "실시간 검색어",
                    keywords: ["계엄령"]
                }
            ]
        };

        const response = await axios.post<NaverTrendResponse>(
            'https://openapi.naver.com/v1/datalab/search',
            requestBody,
            {
                headers: {
                    'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
                    'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching search trends:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trends' },
            { status: 500 }
        );
    }
}