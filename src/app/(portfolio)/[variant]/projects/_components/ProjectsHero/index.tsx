// src/app/(portfolio)/[variant]/projects/_components/ProjectsHero/index.tsx
import { getHighlightedProjects } from '@/sanity/lib/queries';
import { Client } from './Client';
import { SectionProps } from '@/components/ui/Section';

type ProjectsHeroProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const ProjectsHero = async ({ variant, ...props }: ProjectsHeroProps) => {
  const projects = await getHighlightedProjects(variant);

  return <Client projects={projects} {...props} />;
};