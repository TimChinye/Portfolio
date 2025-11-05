import "./globals.css";
import Script from 'next/script';

import localFont from "next/font/local";

const figtree = localFont({
  src: [
    {
      path: '../../public/fonts/Figtree-VariableFont_wght.ttf',
      weight: '300 900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Figtree-Italic-VariableFont_wght.ttf',
      weight: '300 900',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-figtree',
});


const newsreader = localFont({
  src: [
    {
      path: '../../public/fonts/Newsreader-VariableFont_opsz,wght.ttf',
      weight: '200 800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Newsreader-Italic-VariableFont_opsz,wght.ttf',
      weight: '200 800',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-newsreader',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full bg-[#F5F5EF] dark:bg-[#1A1A17] text-[#2F2F2B] dark:text-[#F5F5EF] ${figtree.variable} ${newsreader.variable} font-figtree text-[clamp(0px,1.5dvh,24px)]`} suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
} 