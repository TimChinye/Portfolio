// src/app/(portfolio)/[variant]/_components/FeaturedProjectsSection.tsx
import { Section, type SectionProps } from '@/components/Section';

type FeaturedProjectsSectionProps = {
  variant?: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const FeaturedProjectsSection = async ({ variant, ...props }: FeaturedProjectsSectionProps) => {
  const projects = [{ id: 1, title: 'Project Alpha' }, { id: 2, title: 'Project Beta' }, { id: 3, title: 'Project Gamma' }];

  return (
    <Section {...props}>
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <p>A selection of recent work ({variant} variant).</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div key={p.id} className="border p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <h3 className="text-xl font-semibold">{p.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};