import { getMetaData } from '@/sanity/lib/queries';
import { BubbleCursor } from './BubbleCursor';

export async function HeroSection({
  variant
}: Readonly<{
  variant: 'tim' | 'tiger';
}>) {
  const content = await getMetaData();

  return (
    <main className='h-screen w-full content-center text-center'>
      <BubbleCursor />

      <div className={`inline-block max-w-2xl`}>
        <h1 className="text-4xl mb-8">Homepage for Variant:</h1>
        <div className={`text-8xl capitalize italic font-newsreader`}>{variant}</div>
        <p className="text-xl inline-block font-light whitespace-pre-line"> { content?.defaultSeoDescription } </p>
        <div className="mt-8 p-8 border rounded-lg">
          <h2 className="text-2xl">Hello</h2>
          <p>This text will change color during the animation.</p>
        </div>
      </div>
    </main>
  );
}