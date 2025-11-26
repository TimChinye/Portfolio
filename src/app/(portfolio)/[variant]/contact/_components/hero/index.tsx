import { Section, type SectionProps } from '@/components/ui/Section';
import { BackgroundCurve } from './_components/BackgroundCurve';
import { Client } from './Client';

type ContactHeroSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const ContactHeroSection = (props: ContactHeroSectionProps) => {
  return (
    <Section 
        {...props} 
        fillScreen={false}
        noWrapperBg
        className="p-0 overflow-visible"
        bgClasses="bg-transparent"
    >
      <Client />
      <BackgroundCurve />
    </Section>
  );
}