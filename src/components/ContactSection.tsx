// src/components/shared/ContactSection.tsx
'use client';

import { usePathname } from 'next/navigation';

export const ContactSection = ({
  variant
}: {
  variant: 'tim' | 'tiger';
}) => {
  const pathname = usePathname();
  const isOnContactPage = pathname.includes('/contact');

  return (
    // pt-32 -top-32
    <section className="py-32 -top-32 relative bg-[#ececaa] dark:bg-[#4d4121] text-[#00000080] dark:text-[#FFFFFF80] rounded-t-[6rem] md:rounded-t-[8rem]">
      <div className="p-4 w-full">
        <h1 className="text-center text-[12.925rem] leading-[100%] font-newsreader">
          Let&apos;s build something
          <br />
          <b><i>great</i></b>, together
          <span className="relative inline-block">
            !
            <span className="absolute bottom-[0.25em] left-1/2 -translate-x-1/2 size-[0.15em] rounded-full bg-[#D9D24D]"></span>
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
    </section>
  );
};