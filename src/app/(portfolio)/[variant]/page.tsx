// src/app/(portfolio)/[variant]/page.tsx
import { getMetaData } from '@/sanity/lib/queries';
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

import { Figtree, Newsreader } from "next/font/google";
const figtree = Figtree({ subsets: ["latin"], });
const newsreader = Newsreader({ subsets: ["latin"], style: ['italic'], weight: ['300', '400'] });

export default async function HomePage({
  params
}: Readonly<{
  params: Promise<{ variant: 'tim' | 'tiger' }>;
}>) {
  const { variant } = await params;
  const content = await getMetaData();

  return (
    <main className={`mx-auto my-0 w-2xl h-full content-center text-center ${figtree.className}`}>
      <ThemeSwitcher />
      
      <h1 className="text-4xl mb-8">Homepage for Variant:</h1>
      <div className={`text-8xl capitalize italic ${newsreader.className}`}>{variant}</div>
      <p className="text-xl inline-block font-light whitespace-pre-line"> { content?.defaultSeoDescription } </p>
      <div className="mt-8 p-8 border rounded-lg">
        <h2 className="text-2xl">Hello</h2>
        <p>This text will change color during the animation.</p>
      </div>
    </main>
  );
};