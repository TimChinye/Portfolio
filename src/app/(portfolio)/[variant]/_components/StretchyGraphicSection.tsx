import { Section, type SectionProps } from '@/components/Section';

type StretchyGraphicSectionProps = SectionProps<'section'>;

export const StretchyGraphicSection = (props: StretchyGraphicSectionProps) => {
  return (
    <Section {...props}>
      <h2 className="text-4xl">Stretchy Full-screen Graphic</h2>
    </Section>
  );
};