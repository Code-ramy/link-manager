import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AppProvider } from '@/contexts/app-context';

export const metadata: Metadata = {
  title: 'Link Manager',
  description: 'Your personal web app launcher.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='40 40 120 120'><defs><linearGradient id='highlight-gradient' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ffffff' stop-opacity='0.15' /><stop offset='100%' stop-color='%23ffffff' stop-opacity='0.05' /></linearGradient></defs><circle cx='100' cy='100' r='60' fill='%231d4ed8' opacity='0.7' /><g transform='translate(50, 50) scale(0.5)'><path d='M80,40 L110,40 Q120,40 130,45 Q140,50 145,60 Q150,70 150,80 Q150,90 145,100 Q140,110 130,115 Q120,120 110,120 L80,120' stroke='%23ffffff' stroke-width='18' fill='none' stroke-linecap='round' /><path d='M120,80 L90,80 Q80,80 70,85 Q60,90 55,100 Q50,110 50,120 Q50,130 55,140 Q60,150 70,155 Q80,160 90,160 L120,160' stroke='%23ffffff' stroke-width='18' fill='none' stroke-linecap='round' /></g><circle cx='75' cy='75' r='12' fill='%23ffffff' /><circle cx='75' cy='75' r='6' fill='%23bfdbfe' /><circle cx='75' cy='75' r='3' fill='%233b82f6' /><circle cx='125' cy='125' r='12' fill='%23ffffff' /><circle cx='125' cy='125' r='6' fill='%23bfdbfe' /><circle cx='125' cy='125' r='3' fill='%233b82f6' /></svg>",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
