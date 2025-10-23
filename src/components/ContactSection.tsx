// src/components/shared/ContactSection.tsx
'use client';

import { usePathname } from 'next/navigation';

export const ContactSection = ({
  variant
}: {
  variant: 'tim' | 'tiger';
}) => {
  console.log(variant);
  const pathname = usePathname();
  const isOnContactPage = pathname.includes('/contact');

  return (
    <section className="py-24 px-4 text-center border-t">
      {/* This part is hidden on the contact page to avoid repetition */}
      {!isOnContactPage && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Interested in working together?</h2>
          <p>This intro text is hidden on the main contact page.</p>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-semibold">Get in Touch</h3>
        <p>Contact info for: <span className="capitalize font-bold">{variant}</span></p>
        {/* TODO: Render contact form or contact details from Sanity */}
      </div>
    </section>
  );
};