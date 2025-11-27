import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Section } from "@/components/ui/Section";
import { getProjectBySlug } from '@/sanity/lib/queries';
import { CustomLink } from '@/components/ui/CustomLink';

type Props = {
  params: Promise<{
    variant: 'tim' | 'tiger';
    slug: string;
  }>;
};

export default async function ProjectPage({ params }: Props) {
  const { variant, slug } = await params;
  
  const project = await getProjectBySlug(slug, variant);

  if (!project) {
    notFound();
  }

  return (
    <Section 
      wrapperClassName='m-0 pb-32'
      className='rounded-none content-center min-h-screen py-32 px-6'
      bgClasses="bg-[#F5F5EF] dark:bg-[#1A1A17]"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-16">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 text-center items-center">
          <div className="flex items-center gap-4">
             <div className="inline-block border border-[#2F2F2B]/20 dark:border-[#F5F5EF]/20 px-3 py-1 rounded-full font-figtree text-xs uppercase tracking-widest opacity-60">
              {project.yearCompleted}
            </div>
            <div className="inline-block bg-[#D9D24D] text-black px-3 py-1 rounded-full font-figtree font-bold text-xs uppercase tracking-widest">
              Case Study Coming Soon
            </div>
          </div>

          <h1 className="text-[clamp(3rem,8vw,8rem)] font-figtree font-black uppercase leading-[0.85] text-[#2F2F2B] dark:text-[#F5F5EF]">
            {project.title}
          </h1>

          <p className="text-[clamp(1.25rem,2vw,1.75rem)] font-newsreader italic text-[#2F2F2B]/70 dark:text-[#F5F5EF]/70 max-w-3xl leading-tight">
            {project.shortDescription}
          </p>
        </div>

        {/* Thumbnail Image */}
        {project.thumbnailUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-[#2F2F2B]/10 dark:border-[#F5F5EF]/10">
            <Image 
              src={project.thumbnailUrl} 
              alt={project.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 font-figtree text-[#2F2F2B] dark:text-[#F5F5EF]">
          
          {/* Tech Stack */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 border-b border-current pb-2">
              Technology
            </h3>
            <p className="text-xl md:text-2xl font-light whitespace-pre-line leading-relaxed">
              {project.techDescription || "Technology stack details unavailable."}
            </p>
          </div>

          {/* Context / Featured Desc */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 border-b border-current pb-2">
              Overview
            </h3>
            <p className="text-lg md:text-xl font-newsreader leading-relaxed">
              {project.featuredDescription}
            </p>
            <p className="mt-4 text-sm opacity-60 italic">
              * A detailed breakdown of the architecture, design challenges, and performance metrics will be available in the full case study.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 pt-12">
          {project.ctaPrimary && (
            <a 
              href={project.ctaPrimary.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#2F2F2B] dark:bg-[#F5F5EF] text-[#F5F5EF] dark:text-[#2F2F2B] rounded-full font-bold uppercase tracking-wide hover:scale-105 transition-transform"
            >
              {project.ctaPrimary.label} ↗
            </a>
          )}
          
          {project.ctaSecondary && (
            <a 
              href={project.ctaSecondary.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-[#2F2F2B] dark:border-[#F5F5EF] text-[#2F2F2B] dark:text-[#F5F5EF] rounded-full font-bold uppercase tracking-wide hover:bg-[#2F2F2B]/5 dark:hover:bg-[#F5F5EF]/10 transition-colors"
            >
              {project.ctaSecondary.label}
            </a>
          )}

          <CustomLink
            href="/projects"
            className="px-8 py-4 text-[#2F2F2B] dark:text-[#F5F5EF] font-bold uppercase tracking-wide underline decoration-2 underline-offset-4 hover:decoration-[#D9D24D] transition-all"
          >
            Back to All Projects
          </CustomLink>
        </div>

      </div>
    </Section>
  );
}