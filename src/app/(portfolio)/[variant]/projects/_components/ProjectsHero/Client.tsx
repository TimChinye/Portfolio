"use client";

import Link from 'next/link';
import clsx from 'clsx';
import type { HighlightedProject } from '@/sanity/lib/queries';
import { Section, SectionProps } from '@/components/ui/Section';

const TEXT = {
  TITLE: ["FEATURED", "WORK"],
  DESC: "Every project showcases a seamlessly intuitive experience regardless of the user or device. Achieved by treating quality as a fundamental principle; writing scalable, performant, and accessible code has become second-nature, which inherently leads to both faster delivery and overall just a really damn good product.",
};

const ProjectStrip = ({ project }: { project: HighlightedProject }) => {
  return (
    <Link
      href={`/project/${project.slug.current}`}
      className={clsx(
        "group relative flex gap-4 border-black transition-colors duration-300 hover:bg-[#E4E191]",
        "max-md:w-full max-md:h-24 max-md:items-center max-md:justify-between max-md:border-t-[3px] max-md:px-6",
        "md:h-full md:w-32 md:flex-col md:items-center md:border-l-[3px] md:py-12"
      )}
    >
      {/* Title */}
      <h3 className={clsx(
        "font-black text-[#2F2F2B] leading-none uppercase whitespace-nowrap font-figtree shrink overflow-hidden text-ellipsis",
        "max-md:text-[2rem]", 
        "md:text-[4rem] md:[writing-mode:sideways-lr] md:rotate-180"
      )}>
        {project.title}
      </h3>

      {/* Date & Tag */}
      <div className={clsx(
        "flex gap-4 shrink-0",
        "max-md:items-center",
        "md:flex-col-reverse md:mt-auto md:items-center"
      )}>
        <span className="font-newsreader text-[1.5rem] text-[#3D3B0D]">
          {project.dateCompleted.substring(0, 4)}
        </span>

        {project.isNew && (
          <span className="bg-[#DEDA71] text-[#3D3B0D] font-figtree font-bold uppercase text-[1rem] px-2 py-3 leading-none rounded-sm">
            NEW
          </span>
        )}
      </div>
    </Link>
  );
};

type ProjectsHeroClientProps = {
  projects: HighlightedProject[];
} & SectionProps<'section'>;

export function Client({ projects, ...props }: ProjectsHeroClientProps) {
  return (
    <Section {...props}>
      
      {/* Sidebar Placeholder */}
      <div className="shrink-0 bg-transparent max-md:fixed max-md:bottom-0 max-md:left-0 max-md:z-50 max-md:h-32 max-md:w-full md:h-screen md:w-56" />

      {/* Main Content Area */}
      <main className="
        relative flex flex-col justify-between overflow-hidden bg-[#EFEFD0]
        max-md:min-h-[calc(100vh-(var(--spacing)*32))] max-md:w-full
        md:h-screen md:flex-1 md:flex-row md:rounded-tl-[4rem]
      ">
        {/* Hero Text & Description */}
        <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 flex-1">
          
          {/* Featured Work Title */}
          <div className="flex flex-col items-start gap-3">
            {TEXT.TITLE.map((line, i) => (
              <h1
                key={i}
                className="bg-[#ECE9A7] px-2 font-figtree font-black text-[clamp(4rem,10vw,10rem)] leading-[0.85] tracking-[-0.025em] text-black"
              >
                {line}
              </h1>
            ))}
          </div>

          {/* Description Paragraph */}
          <div className="mt-12 md:mt-16 max-w-3xl">
            <p className="font-newsreader text-[1.5rem] md:text-[2.25rem] leading-[1.1] tracking-[0.025em] text-[#2F2F2B]">
              {TEXT.DESC}
            </p>
          </div>
        </div>

        {/* Highlighted Projects */}
        <div className="flex shrink-0 bg-[#EFEFD0] max-md:w-full max-md:flex-col md:h-full md:flex-row">
          {projects.map((project) => (
            <ProjectStrip key={project._id} project={project} />
          ))}
        </div>

      </main>
    </Section>
  );
}