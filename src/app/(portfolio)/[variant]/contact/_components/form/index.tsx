"use client";

import { Section, type SectionProps } from '@/components/ui/Section';
import { AvailabilityWidget } from './_components/AvailabilityWidget';
import { PuzzleForm } from './_components/PuzzleForm';

type ContactFormSectionProps = {
  variant: 'tim' | 'tiger';
};

export function ContactFormSection({ variant }: ContactFormSectionProps) {
  return (
    <Section
      bgClasses="bg-transparent"
      fillScreen={false}
      className="overflow-visible px-4 md:px-16 py-0"
      wrapperClassName="my-32"
    >
      <div className="
      max-md:flex max-md:flex-col max-md:py-48
      md:grid md:grid-cols-5 md:gap-8 md:mx-auto
      ">
        
        {/* Availability Widget */}
        <div className="block col-span-2 relative text-[1rem] md:text-[clamp(0.625rem,1.125vw,1rem)]">
          <div className="md:h-screen sticky top-0 flex items-center justify-center">
            <AvailabilityWidget />
          </div>
        </div>

        {/* Contact Form Area */}
        <div className="md:py-48 col-span-3 flex flex-col gap-8">
          <div className="min-h-[600px] flex items-center justify-center rounded-xl p-8">
             <PuzzleForm variant={variant} />
          </div>
        </div>
      </div>
    </Section>
  );
}