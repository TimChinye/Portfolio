// src/app/(portfolio)/[variant]/projects/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { ProjectsHero } from './_components/ProjectsHero';
import { getAllProjects } from '@/sanity/lib/queries';
import { PortfolioIcon } from '@/components/ui/PortfolioIcon';

type Props = {
  params: Promise<{ variant: 'tim' | 'tiger' }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { variant } = await params;
  const projects = await getAllProjects(variant);

  return (
    <>
      <ProjectsHero variant={variant} className="p-0 relative w-full flex flex-col md:flex-row" />

      <div className="w-full py-24 px-6 flex flex-col items-center text-center gap-8 border-t-2 border-black/20 dark:border-white/20">
        <div className="inline-block border-2 border-[#86800E]/50 text-[#86800E] dark:border-[#D9D24D]/50 dark:text-[#D9D24D] px-4 py-1 rounded-full font-figtree font-bold uppercase tracking-widest text-sm">
          Temporary View
        </div>
        <p className="max-w-2xl font-newsreader text-lg md:text-2xl text-[#2F2F2B]/80 dark:text-[#F5F5EF]/80 leading-relaxed">
          The full interactive &quot;Discovery&quot; scrolling experience is currently in development and scheduled for release after the academic year concludes.
        </p>
        <p className="opacity-50 font-figtree text-sm uppercase tracking-wide">
          In the meantime, please browse the project list below
        </p>
      </div>
      
      {/* 
        The "Discovery" Section: 
        A continuous scroll of all projects. 
      */}
      <Section wrapperClassName='m-0 pb-32' className='rounded-none p-0'>
        <div className="flex flex-col">
          {projects.map((project, index) => (
            <div 
              key={project._id} 
              id={project.slug.current}
              className="group sticky top-0 min-h-screen flex flex-col md:flex-row border-t-2 border-black/10 dark:border-white/10"
            >
              {/* Project Index / Mobile Header */}
              <div className="p-6 md:p-12 flex justify-between items-start md:w-32 md:shrink-0 md:border-r-2 md:border-black/10 dark:md:border-white/10">
                <span className="font-figtree font-bold text-xl opacity-50">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                {/* Mobile specific visual anchor */}
                <div className="md:hidden">
                  <PortfolioIcon className="w-6 h-6 opacity-20" />
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col relative">
                
                {/* Image / Graphic Area */}
                <div className="flex-1 relative min-h-[40vh] overflow-hidden bg-[#EFEFD0]/20 dark:bg-[#2F2F2B]/20">
                  {project.thumbnailUrl ? (
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <PortfolioIcon className="w-1/3 h-auto" />
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-[#EFEFD080] to-50% to-transparent dark:from-[#2F2F2B] opacity-87.5" />
                </div>

                {/* Text Content */}
                <div className="relative z-10 p-6 md:p-16 flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-newsreader italic text-xl md:text-2xl text-[#2F2F2B]/60 dark:text-[#F5F5EF]/60">
                        {project.yearCompleted}
                      </span>
                      <span className="px-3 py-1 rounded-full border border-[#86800E]/50 text-[#86800E] dark:border-[#D9D24D]/50 dark:text-[#D9D24D] text-xs font-bold uppercase tracking-widest dark:bg-[#F5F5EF]/5">
                        Case Study Coming Soon
                      </span>
                    </div>
                    
                    <h2 className="text-[clamp(3rem,6vw,6rem)] font-figtree font-black uppercase leading-[0.85] text-[#2F2F2B] dark:text-[#F5F5EF]">
                      {project.title}
                    </h2>
                  </div>

                  <p className="max-w-2xl font-newsreader text-lg md:text-2xl text-[#2F2F2B]/80 dark:text-[#F5F5EF]/80 leading-relaxed">
                    {project.shortDescription}
                  </p>

                  <div className="pt-8">
                    <Link 
                      href={`/project/${project.slug.current}`}
                      className="inline-flex items-center gap-3 text-lg font-bold uppercase tracking-wide hover:text-[#D9D24D] transition-colors"
                    >
                      View Details <span className="text-xl">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}