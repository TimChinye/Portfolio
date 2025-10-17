// import { getGlobalContent } from '@/sanity/lib/queries';

import { Figtree, Newsreader } from "next/font/google";
const figtree = Figtree({ subsets: ["latin"], });
const newsreader = Newsreader({ subsets: ["latin"], style: ['italic'] });

export default async function HomePage({
  params
}: Readonly<{
  params: Promise<{ variant: 'tim' | 'tiger' }>;
}>) {
  const { variant } = await params;
  // const content = await getGlobalContent(variant);

  return (
    <main className={`h-full content-center text-center ${figtree.className}`}>
      <h1 className="text-4xl mb-16">Homepage for Variant:</h1>
      <div className={`text-8xl capitalize  italic ${newsreader.className}`}>{variant}</div>
      {/* <p className="text-xl w-2xl inline-block"> { content?.defaultSeoDescription } </p> */}
    </main>
  );
}