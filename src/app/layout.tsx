import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: '네이버 실시간 검색어 트렌드',
    description: '네이버 실시간 검색어 트렌드 분석',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
        </body>
        </html>
    );
}