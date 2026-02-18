import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '30A Wine Festival AI Concierge',
  description: 'Your AI guide to the 14th Annual 30A Wine Festival at Alys Beach, Florida. February 18-22, 2026.',
  keywords: ['30A Wine Festival', 'Alys Beach', 'wine festival', 'AI concierge', 'Florida events'],
  authors: [{ name: 'Deven Spear' }],
  openGraph: {
    title: '30A Wine Festival AI Concierge',
    description: 'Your AI guide to the 14th Annual 30A Wine Festival at Alys Beach',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="safe-bottom desktop-wrapper">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
