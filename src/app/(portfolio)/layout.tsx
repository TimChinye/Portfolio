import "./globals.css";

import type { Metadata } from 'next'

import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

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
      <body className="h-full" suppressHydrationWarning>
        {children}
        </body>
    </html>
  );
}