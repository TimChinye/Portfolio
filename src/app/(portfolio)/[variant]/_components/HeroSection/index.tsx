import { getMetaData } from '@/sanity/lib/queries';
import { BubbleCursor } from './BubbleCursor';
import { Section, type SectionProps } from '@/components/Section';

type HeroSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export async function HeroSection({ variant, ...props }: HeroSectionProps) {
  const content = await getMetaData();

  return (
    <Section {...props}>
      <main className='h-full w-full flex items-center justify-center text-center'>
        <BubbleCursor />
        <div className={`inline-block max-w-2xl px-4`}>
          <h1 className="text-4xl mb-8">Homepage for Variant:</h1>
          <div className={`text-8xl capitalize italic font-newsreader`}>{variant}</div>
          <p className="text-xl inline-block font-light whitespace-pre-line"> { content?.defaultSeoDescription } </p>
          <div className="mt-8 p-8 border rounded-lg">
            <h2 className="text-2xl">Hello</h2>
            <p>This text will change color during the animation.</p>
          </div>
        </div>
      </main>
    </Section>
  );
}