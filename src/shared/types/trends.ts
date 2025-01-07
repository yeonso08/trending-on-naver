export interface NaverTrendResponse {
    startDate: string;
    endDate: string;
    timeUnit: string;
    results: Array<{
        data: TrendData[];
        keywords: string[];
        title: string;
    }>;
}

export interface TrendData {
    period: string;
    ratio: number;
}

export interface KeywordGroup {
    groupName: string;
    keywords: string[];
}
