// src/components/ContactSection.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Section, type SectionProps } from '@/components/Section';

type ContactSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const ContactSection = ({ variant, ...props }: ContactSectionProps) => {
  const pathname = usePathname();
  const isOnContactPage = pathname.includes('/contact');

  return (
    <Section {...props}>
      <div className="w-full">
        <h1 className="text-center text-[12.925rem] leading-[100%] font-newsreader">
          Let&apos;s build something
          <br />
          <b><i>great</i></b>, together
          <span className="relative inline-block">
            !
            <span className="absolute bottom-[0.1em] left-1/2 -translate-x-1/2 size-[0.2em] rounded-full bg-[#D9D24D]"></span>
          </span>
        </h1>
      </div>

      {!isOnContactPage && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Interested in working together?</h2>
          <p>This intro text is hidden on the main contact page.</p>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-semibold">Get in Touch</h3>
        <p>Contact info for: <span className="capitalize font-bold">{variant}</span></p>
      </div>
    </Section>
  );
};