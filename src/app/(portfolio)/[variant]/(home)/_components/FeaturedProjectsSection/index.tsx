import { type SectionProps } from '@/components/ui/Section';
import { getFeaturedProjects } from '@/sanity/lib/queries';
import { Manager } from './Manager';

type FeaturedProjectsSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const FeaturedProjectsSection = async ({ variant, ...props }: FeaturedProjectsSectionProps) => {
  const projects = await getFeaturedProjects(variant);

  // Don't render the section if there are no projects to feature
  if (!projects || projects.length === 0) return null;

  return <Manager projects={projects} {...props} />;
};