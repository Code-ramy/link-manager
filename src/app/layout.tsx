import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Link Manager',
  description: 'Your personal web app launcher.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='15 15 170 170'><defs><linearGradient id='bg-gradient' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231e3a8a' /><stop offset='50%' stop-color='%232563eb' /><stop offset='100%' stop-color='%233b82f6' /></linearGradient><linearGradient id='highlight-gradient' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ffffff' stop-opacity='0.15' /><stop offset='100%' stop-color='%23ffffff' stop-opacity='0.05' /></linearGradient></defs><rect x='15' y='15' width='170' height='170' rx='40' ry='40' fill='url(%23bg-gradient)' /><rect x='25' y='25' width='150' height='150' rx='32' ry='32' fill='url(%23highlight-gradient)' /><circle cx='100' cy='100' r='60' fill='%231d4ed8' opacity='0.7' /><g transform='translate(50, 50) scale(0.5)'><path d='M80,40 L110,40 Q120,40 130,45 Q140,50 145,60 Q150,70 150,80 Q150,90 145,100 Q140,110 130,115 Q120,120 110,120 L80,120' stroke='%23ffffff' stroke-width='18' fill='none' stroke-linecap='round' /><path d='M120,80 L90,80 Q80,80 70,85 Q60,90 55,100 Q50,110 50,120 Q50,130 55,140 Q60,150 70,155 Q80,160 90,160 L120,160' stroke='%23ffffff' stroke-width='18' fill='none' stroke-linecap='round' /></g><circle cx='75' cy='75' r='12' fill='%23ffffff' /><circle cx='75' cy='75' r='6' fill='%23bfdbfe' /><circle cx='75' cy='75' r='3' fill='%233b82f6' /><circle cx='125' cy='125' r='12' fill='%23ffffff' /><circle cx='125' cy='125' r='6' fill='%23bfdbfe' /><circle cx='125' cy='125' r='3' fill='%233b82f6' /><rect x='15' y='15' width='170' height='170' rx='40' ry='40' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-opacity='0.1' /></svg>",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
