import { getGlobalContent, getHeroProjects } from '@/sanity/lib/queries';
import { Section, type SectionProps } from '@/components/ui/Section';
import { Client } from './Client';

type HeroSectionProps = {
  variant?: 'tim' | 'tiger';
} & SectionProps<'section'>;

export async function HeroSection({ variant, ...props }: HeroSectionProps) {
  if (!variant) return null;

  const [globalContent, projects] = await Promise.all([
    getGlobalContent(),
    getHeroProjects(variant),
  ]);

  variant = 'tim';

  const heroName = variant === 'tim' ? globalContent?.timHeroName : globalContent?.tigerHeroName;
  const heroBio = variant === 'tim' ? globalContent?.timHeroBio : globalContent?.tigerHeroBio;
  
  if (!heroName || !heroBio) {
    // Graceful fallback if CMS data is missing
    return (
      <Section {...props}>
        <div className="h-full w-full flex items-center justify-center text-center">
          <p>Error: Could not load hero content from the CMS.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section {...props}>
      <Client 
        variant={variant}
        heroName={heroName}
        heroBio={heroBio}
        projects={projects}
      />
    </Section>
  );
}