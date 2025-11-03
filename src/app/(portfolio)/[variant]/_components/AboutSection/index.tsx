import { getAboutPageData } from '@/sanity/lib/queries';

import { Client } from './Client';
import { Section, type SectionProps } from '@/components/ui/Section';

type AboutSectionProps = {
  variant?: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const AboutSection = async({ variant, ...props }: AboutSectionProps) => {
  if (variant !== 'tim') return null;
  
  const data = await getAboutPageData();
  if (!data) return null;

  return (
    // The Section component provides the entry animation and sticky context
    <Section
      {...props}
      className="flex items-center justify-center"
    >
      {/* This taller div acts as the "track" for the scroll animation */}
      <Client data={data} />
    </Section>
  );
}