import { getAboutPageData } from '@/sanity/lib/queries';

import { Client } from './Client';
import { Section, type SectionProps } from '@/components/ui/Section';

type AboutSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const AboutSection = async ({ variant, ...props }: AboutSectionProps) => {
  const data = await getAboutPageData();
  if (!data) return null;

  return (
    <Section 
      {...props}
    >
      <Client data={data} />
    </Section>
  );
}