import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: '온리(Onri) — 온전한 나로 쉬어가는 곳',
  description:
    '결이 맞는 사람끼리 안전하게 연결되는 성소수자 친화 매칭 앱',
  openGraph: {
    title: '온리(Onri) — 온전한 나로 쉬어가는 곳',
    description:
      '결이 맞는 사람끼리 안전하게 연결되는 성소수자 친화 매칭 앱',
    url: SITE_URL,
    siteName: '온리(Onri)',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 800,
        height: 400,
        alt: '온리 — 온전한 나로 쉬어가는 곳',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '온리(Onri) — 온전한 나로 쉬어가는 곳',
    description:
      '결이 맞는 사람끼리 안전하게 연결되는 성소수자 친화 매칭 앱',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
