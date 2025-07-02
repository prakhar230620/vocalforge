import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { PWAUpdateNotification } from "@/components/pwa-update-notification"

export const metadata: Metadata = {
  title: 'VocalForge',
  description: 'Convert text to natural-sounding speech with AI',
  manifest: '/manifest.json',
  applicationName: 'VocalForge',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VocalForge',
    startupImage: [
      {
        url: '/apple-splash-screen.svg',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.svg',
    shortcut: '/icons/icon-192x192.svg',
    apple: '/icons/icon-192x192.svg',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#18181b',
  },
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <PWAUpdateNotification />
      </body>
    </html>
  );
}
