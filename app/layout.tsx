import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fauzan Sanjaya | AI Solutions Engineer & Mobile Fullstack Developer',
  description:
    'Portfolio of Fauzan Putra Sanjaya, an AI Solutions Engineer and Mobile Fullstack Developer building LLM agents, RAG pipelines, and scalable mobile & web systems.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0066cc',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Font & ikon diimpor di app/globals.css (sebelum Tailwind) supaya urutan CSS sama dengan situs lama */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#f5f5f7] font-display min-h-screen text-text-main antialiased selection:bg-[#0066cc]/20 selection:text-[#0066cc] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
