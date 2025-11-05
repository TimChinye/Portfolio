import { getAboutPageData } from '@/sanity/lib/queries';

import { Client } from './Client';
import { Section, type SectionProps } from '@/components/ui/Section';

type AboutSectionProps = {
  variant?: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const AboutSection = async ({ variant, ...props }: AboutSectionProps) => {
  if (variant !== 'tim') return null;
  
  const data = await getAboutPageData();
  if (!data) return null;

  return (
    <Section
      {...props}
      yRange={{
        desktop: ['0rem', '-8rem'],
        mobile: ['0rem', '-6rem'],
      }}
      scrollTrackHeight="300vh"
    >
      <Client data={data} />
    </Section>
  );
}