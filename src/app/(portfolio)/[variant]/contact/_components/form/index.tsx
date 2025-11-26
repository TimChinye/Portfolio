"use client";

import { Section } from '@/components/ui/Section';
import { AvailabilityWidget } from './_components/AvailabilityWidget';
import { PuzzleForm } from './_components/PuzzleForm';

type ContactFormProps = {
    data?: {
        // Data types here
    };
};

export function ContactFormSection({ data }: ContactFormProps) {
  return (
    <Section
      bgClasses="bg-transparent"
      fillScreen={false}
      className="overflow-visible px-4 md:px-16 py-0"
      wrapperClassName="m-0"
    >
      <div className="grid grid-cols-5 gap-8 mx-auto">
        
        {/* LEFT COLUMN: Availability Widget */}
        <div className="block col-span-2 relative">
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <AvailabilityWidget />
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Form Area */}
        <div className="py-48 col-span-3 flex flex-col gap-8">
          {/* Replaced placeholder with PuzzleForm */}
          <div className="min-h-[600px] flex items-center justify-center rounded-xl p-8">
             <PuzzleForm />
          </div>
        </div>
      </div>
    </Section>
  );
}