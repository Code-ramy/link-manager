import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Link Manager',
  description: 'Your personal web app launcher.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><polygon id='polygon-bg' points='100,20 165,60 165,140 100,180 35,140 35,60' /><linearGradient id='bg-gradient' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%234f46e5'/><stop offset='100%' stop-color='%231e3a8a'/></linearGradient><filter id='inner-shadow' x='-50%' y='-50%' width='200%' height='200%'><feOffset dx='0' dy='2' result='off'/><feGaussianBlur in='off' stdDeviation='4' result='blur'/><feComposite in='SourceGraphic' in2='blur' operator='arithmetic' k2='-1' k3='1'/></filter><radialGradient id='highlight' cx='30%' cy='30%' r='50%'><stop offset='0%' stop-color='%23ffffff' stop-opacity='0.25' /><stop offset='100%' stop-color='%23ffffff' stop-opacity='0' /></radialGradient></defs><use href='%23polygon-bg' fill='url(%23bg-gradient)' filter='url(%23inner-shadow)' /><use href='%23polygon-bg' fill='url(%23highlight)' /><g transform='translate(60,60) scale(0.6)'><path d='M50,30 h20 a15,15 0 0,1 15,15 v20' stroke='%23ffffff' stroke-width='12' fill='none' stroke-linecap='round' /><path d='M90,70 h-20 a15,15 0 0,0 -15,15 v20' stroke='%23ffffff' stroke-width='12' fill='none' stroke-linecap='round' /></g><circle cx='80' cy='80' r='8' fill='%23fffb' /><circle cx='120' cy='120' r='8' fill='%23fffb' /></svg>",
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
