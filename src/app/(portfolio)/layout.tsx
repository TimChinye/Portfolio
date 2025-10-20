import "./globals.css";

import type { Metadata } from 'next';

import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from '@/components/Navbar';

import Script from 'next/script';

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <Script src="https://unpkg.com/@tailwindcss/browser" strategy="beforeInteractive" />
        <style type="text/tailwindcss">{` @import "tailwindcss" ; @custom-variant dark (&:where(.dark, .dark *)) `}</style>
      </head>
      <body className="h-full" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Navbar />
        {children}
        </ThemeProvider>
        </body>
    </html>
  );
}