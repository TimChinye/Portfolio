import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ProgressBar } from '@/components/ProgressBar';
import { Navbar } from '@/components/Navbar';

import { Figtree, Newsreader } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-figtree',
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ['italic', 'normal'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-newsreader',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full bg-[#F5F5EF] dark:bg-[#2F2F2B] text-[#2F2F2B] dark:text-[#F5F5EF] ${figtree.variable} ${newsreader.variable} font-figtree`} suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProgressBar />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}