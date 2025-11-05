import { Section, type SectionProps } from '@/components/ui/Section';

type WorkGraphicSectionProps = SectionProps<'section'>;

export const WorkGraphicSection = (props: WorkGraphicSectionProps) => {
  return (
    <Section {...props}>
      <h2 className="text-4xl">&quot;Let us work&quot; Full-screen Graphic</h2>
    </Section>
  );
};