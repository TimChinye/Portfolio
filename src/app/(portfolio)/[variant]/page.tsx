import { sanityFetch } from "@/sanity/lib/live";
import { groq } from "next-sanity";
const settingsQuery = groq`*[_type == "siteSettings"][0]`;

import { Figtree, Newsreader } from "next/font/google";
const figtree = Figtree({ subsets: ["latin"], });
const newsreader = Newsreader({ subsets: ["latin"], style: ['italic'] });

export default async function HomePage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;

  const { data: content } = await sanityFetch({ query: settingsQuery });

  return (
    <main className={`h-full content-center text-center ${figtree.className}`}>
      <h1 className="text-4xl mb-16">Homepage for Variant:</h1>
      <div className={`text-8xl capitalize  italic ${newsreader.className}`}>{variant}</div>
      <p className="text-xl w-2xl inline-block">
        { content?.globalSeoDescription }
      </p>
    </main>
  );
}