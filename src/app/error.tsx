'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto py-6 px-4 flex flex-col items-center justify-center min-h-screen">
            <Alert variant="destructive" className="max-w-md mb-4">
                <AlertTitle>오류가 발생했습니다</AlertTitle>
                <AlertDescription>
                    {error.message || '알 수 없는 오류가 발생했습니다.'}
                </AlertDescription>
            </Alert>
            <Button onClick={reset}>다시 시도</Button>
        </div>
    );
}