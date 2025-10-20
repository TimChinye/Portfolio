import "./globals.css";

import type { Metadata } from 'next';

import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProgressBar } from '@/components/ProgressBar';
import { Navbar } from '@/components/Navbar';

import Script from 'next/script';
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

const globalQuery = groq`*[_type == "globalContent"][0]{ defaultSeoTitle }`;

export async function generateMetadata(): Promise<Metadata> {
  const { data: content } = await sanityFetch({ query: globalQuery });

  return {
    title: content?.globalSeoTitle || "Portfolio",
    description: content?.defaultSeoDescription
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F5F5EF] dark:bg-[#2F2F2B]" suppressHydrationWarning>
      <head>
        <Script src="https://unpkg.com/@tailwindcss/browser" strategy="beforeInteractive" />
        <style type="text/tailwindcss">{` @import "tailwindcss" ; @custom-variant dark (&:where(.dark, .dark *)) `}</style>
      </head>
      <body className={`h-full ${figtree.variable} ${newsreader.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ProgressBar />
        <Navbar />
        {children}
        </ThemeProvider>
        </body>
    </html>
  );
}