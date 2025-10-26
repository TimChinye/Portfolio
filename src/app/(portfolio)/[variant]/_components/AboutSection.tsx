// src/app/(portfolio)/[variant]/_components/AboutSection.tsx
import { Section, type SectionProps } from '@/components/Section';

type AboutSectionProps = {
  variant?: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const AboutSection = async ({ variant, ...props }: AboutSectionProps) => {
  if (variant === 'tiger') return null;
  const aboutText = 'This is the about section...';

  return (
    <Section {...props}>
      <div className="text-center px-4">
        <h2 className="text-3xl font-bold mb-4">About Me</h2>
        <p className="max-w-2xl mx-auto">{aboutText}</p>
      </div>
    </Section>
  );
};