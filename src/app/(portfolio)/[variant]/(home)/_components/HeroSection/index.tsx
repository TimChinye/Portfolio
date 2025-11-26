import { forwardRef } from 'react';
import { getGlobalContent, getHeroProjects } from '@/sanity/lib/queries';
import { Section, type SectionProps } from '@/components/ui/Section';
import { Client } from './Client';

type HeroSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

const HeroSectionComponent = forwardRef<HTMLDivElement, HeroSectionProps>(
  async ({ variant, ...props }, ref) => {

  let [globalContent, projects] = await Promise.all([
    getGlobalContent(),
    getHeroProjects(variant),
  ]);

  const DEV_MODE_PROJECT_COUNT = 15;
  if (process.env.NODE_ENV === 'development' && projects.length > 0 && projects.length < DEV_MODE_PROJECT_COUNT) {
    projects = Array.from({ length: DEV_MODE_PROJECT_COUNT }, (_, i) => {
      // Cycle through the original projects array
      const originalProject = projects[i % projects.length];
      // Return a new object with a unique _id to prevent React key errors
      return {
        ...originalProject,
        _id: `${originalProject._id}-dev-${i}`,
      };
    });
  }

  const heroName = variant === 'tim' ? globalContent?.timHeroName : globalContent?.tigerHeroName;
  const heroBio = variant === 'tim' ? globalContent?.timHeroBio : globalContent?.tigerHeroBio;
  
  if (!heroName || !heroBio) {
    // Graceful fallback if CMS data is missing
    return (
      <Section {...props} ref={ref}>
        <div className="size-full flex items-center justify-center text-center">
          <p>Error: Could not load hero content from the CMS.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section {...props} ref={ref}>
      <Client 
        variant={variant}
        heroName={heroName}
        heroBio={heroBio}
        projects={projects}
      />
      </Section>
    );
  }
);

HeroSectionComponent.displayName = 'HeroSection';
export const HeroSection = HeroSectionComponent;