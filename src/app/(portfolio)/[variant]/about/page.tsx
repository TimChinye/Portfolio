// src/app/(portfolio)/[variant]/about/page.tsx
import { Section } from '@/components/ui/Section';
import { notFound } from 'next/navigation';
import { getGlobalContent } from '@/sanity/lib/queries';
import { PortfolioIcon } from '@/components/ui/PortfolioIcon';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ variant: 'tim' | 'tiger' }>;
};

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage({ params }: Props) {
  const { variant } = await params;

  if (variant !== 'tim') {
    return notFound();
  }

  const data = await getGlobalContent();

  return (
    <Section 
      wrapperClassName='m-0 pb-32'
      className='rounded-none content-center text-center min-h-screen flex flex-col items-center justify-center gap-12 px-6'
      bgClasses="bg-[#F5F5EF] dark:bg-[#1A1A17]"
    >
      {/* Header / Badge */}
      <div className="flex flex-col items-center gap-6">
        <PortfolioIcon className="size-16 text-black dark:text-white" />
        
        <div className="inline-block border-2 border-[#86800E]/50 text-[#86800E] dark:text-[#D9D24D] dark:border-[#D9D24D]/50 px-4 py-1 rounded-full font-figtree font-bold uppercase tracking-widest text-sm">
          Coming Soon
        </div>
        
        <h1 className="text-[clamp(3rem,8vw,6rem)] font-newsreader font-medium leading-none text-[#2F2F2B] dark:text-[#F5F5EF]">
          About Me
        </h1>
      </div>

      {/* Main Content Placeholder */}
      <div className="max-w-2xl text-lg md:text-2xl font-newsreader leading-relaxed text-[#2F2F2B]/80 dark:text-[#F5F5EF]/80">
          <p>
            The full story is currently being written. For now, know that I am dedicated to 
            building scalable, performant, and accessible web experiences.
          </p>
      </div>

      {/* Footer / Link Section */}
      <div className="mt-8 flex flex-col items-center gap-6 max-w-lg">
        <p className="opacity-50 font-figtree text-sm uppercase tracking-wide leading-relaxed">
          The complete interactive journey is in development and scheduled for release after the academic year concludes.
        </p>
        
        <div className="w-12 h-px bg-current opacity-20" />

        <p className="opacity-75 font-figtree text-sm tracking-wide leading-relaxed">
          In the meantime, to see a deep dive into my frontend engineering skills, check out the public release of <b>
            <a
              href="https://nestyourcss.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center underline decoration-2 underline-offset-4 decoration-[#2F2F2B]/20 dark:decoration-[#F5F5EF]/20 hover:decoration-[#86800E] dark:hover:decoration-[#D9D24D] hover:text-[#86800E] dark:hover:text-[#D9D24D] transition-all"
            >NestYourCSS</a>
            </b>:
        </p>

        <a 
          href="https://www.reddit.com/r/webdev/comments/1ms22sn/showcase_saturday_tried_to_make_an_awwwardslevel/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-[#86800E] dark:text-[#D9D24D] font-figtree font-bold uppercase tracking-wide text-sm transition-colors hover:text-[#2F2F2B] dark:hover:text-[#F5F5EF]"
        >
          <span className="border-b-2 border-transparent group-hover:border-current transition-all duration-300">
            Read the Announcement on Reddit
          </span>
          <span className="relative -top-px transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            ↗
          </span>
        </a>
      </div>
    </Section>
  );
}