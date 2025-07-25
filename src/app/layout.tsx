import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AppProvider } from '@/contexts/app-context';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


export const metadata: Metadata = {
  title: 'Link Manager',
  description: 'A simple and beautiful link manager app.',
  icons: {
    icon: "data:image/svg+xml,<svg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'><path opacity='0.7' d='M60 120C93.1371 120 120 93.1371 120 60C120 26.8629 93.1371 0 60 0C26.8629 0 0 26.8629 0 60C0 93.1371 26.8629 120 60 120Z' fill='%231D4ED8'/><path d='M47 30H61.5H65C70 30 72.5 31.25 75 32.5C78.3333 34.1667 80.8333 36.6667 82.5 40C84.1667 43.3333 85 46.6667 85 50C85 53.3333 84.1667 56.6667 82.5 60C80.8333 63.3333 78.3333 65.8333 75 67.5C71.6667 69.1667 68.3333 70 65 70L50.5 69.5' stroke='white' stroke-width='9' stroke-linecap='round'/><path d='M71.051 90L56.551 90.0185L53.051 90.023C48.051 90.0293 45.5495 88.7825 43.0479 87.5357C39.7124 85.8733 37.2092 83.3765 35.5383 80.0453C33.8674 76.7141 33.0298 73.3818 33.0255 70.0485C33.0213 66.7152 33.8504 63.3808 35.5128 60.0453C37.1752 56.7099 39.672 54.2067 43.0032 52.5358C46.3344 50.8648 49.6667 50.0273 53 50.023L67.5006 50.5045' stroke='white' stroke-width='9' stroke-linecap='round'/><path d='M37 42C43.6274 42 49 36.6274 49 30C49 23.3726 43.6274 18 37 18C30.3726 18 25 23.3726 25 30C25 36.6274 30.3726 42 37 42Z' fill='white'/><path d='M37 36C40.3137 36 43 33.3137 43 30C43 26.6863 40.3137 24 37 24C33.6863 24 31 26.6863 31 30C31 33.3137 33.6863 36 37 36Z' fill='%23BFDBFE'/><path d='M37 33C38.6569 33 40 31.6569 40 30C40 28.3431 38.6569 27 37 27C35.3431 27 34 28.3431 34 30C34 31.6569 35.3431 33 37 33Z' fill='%233B82F6'/><path d='M83 102C89.6274 102 95 96.6274 95 90C95 83.3726 89.6274 78 83 78C76.3726 78 71 83.3726 71 90C71 96.6274 76.3726 102 83 102Z' fill='white'/><path d='M83 96C86.3137 96 89 93.3137 89 90C89 86.6863 86.3137 84 83 84C79.6863 84 77 86.6863 77 90C77 93.3137 79.6863 96 83 96Z' fill='%23BFDBFE'/><path d='M83 93C84.6569 93 86 91.6569 86 90C86 88.3431 84.6569 87 83 87C81.3431 87 80 88.3431 80 90C80 91.6569 81.3431 93 83 93Z' fill='%233B82F6'/></svg>",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
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
