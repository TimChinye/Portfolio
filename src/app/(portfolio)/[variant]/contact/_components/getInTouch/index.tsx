import { Section, type SectionProps } from '@/components/ui/Section';
import { Client } from './Client';

type GetInTouchSectionProps = SectionProps<'section'>;

export const GetInTouchSection = (props: GetInTouchSectionProps) => {
  return (
    <Section {...props}>
      <Client />
    </Section>
  );
};