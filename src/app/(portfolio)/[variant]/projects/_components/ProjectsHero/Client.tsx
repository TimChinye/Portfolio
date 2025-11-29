// src/app/(portfolio)/[variant]/projects/_components/ProjectsHero/Client.tsx
"use client";

import Link from 'next/link';
import clsx from 'clsx';
import type { HighlightedProject } from '@/sanity/lib/queries';
import { Section, SectionProps } from '@/components/ui/Section';

// --- CONFIGURATION ---
const TEXT = {
  TITLE: ["FEATURED", "WORK"],
  DESC: "Every project showcases a seamlessly intuitive experience regardless of the user or device. Achieved by treating quality as a fundamental principle; writing scalable, performant, and accessible code has become second-nature, which inherently leads to both faster delivery and overall just a really damn good product.",
};

// --- SUB-COMPONENTS ---

const ProjectStrip = ({ project }: { project: HighlightedProject }) => {
  return (
    <Link
      href={`/project/${project.slug.current}`}
      className={clsx(
        "group relative flex gap-4 border-black transition-colors duration-300 hover:bg-[#E4E191]",
        // Mobile: Horizontal rows, border-top, fixed height
        "max-md:w-full max-md:h-24 max-md:items-center max-md:justify-between max-md:border-t-[3px] max-md:px-6",
        // Desktop: Vertical columns, border-left, fixed width
        "md:h-full md:w-32 md:flex-col md:items-center md:border-l-[3px] md:py-12"
      )}
    >
      {/* Title */}
      <h3 className={clsx(
        "font-black text-[#2F2F2B] leading-none uppercase whitespace-nowrap font-figtree shrink overflow-hidden text-ellipsis",
        // Mobile: Normal text, size 64 unitless (4rem)
        "max-md:text-[2rem]", 
        // Desktop: Rotated vertical text, size 64 unitless (4rem)
        "md:text-[4rem] md:[writing-mode:sideways-lr] md:rotate-180"
      )}>
        {project.title}
      </h3>

      {/* Meta Container */}
      <div className={clsx(
        "flex gap-4 shrink-0",
        // Mobile: Row aligned to the right
        "max-md:items-center",
        // Desktop: Column aligned (visually bottom due to rotation flow)
        "md:flex-col-reverse md:mt-auto md:items-center"
      )}>
        {/* Year - Size 24 unitless (1.5rem) */}
        <span className="font-newsreader text-[1.5rem] text-[#3D3B0D]">
          {project.dateCompleted.substring(0, 4)}
        </span>

        {/* New Tag - Size 16 unitless (1rem) */}
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
      
      {/* 
        1. Sidebar Placeholder 
        - Desktop: Left side, width 14rem (w-56), transparent.
        - Mobile: Fixed at bottom, height 8rem (h-32), transparent.
      */}
      <div className="shrink-0 bg-transparent max-md:fixed max-md:bottom-0 max-md:left-0 max-md:z-50 max-md:h-32 max-md:w-full md:h-screen md:w-56" />

      {/* 
        2. Main Content Area 
        - Desktop: rounded-l-[4rem], flex-row
        - Mobile: full width, flex-col. Height calculated to leave space for fixed sidebar.
      */}
      <main className="
        relative flex flex-col justify-between overflow-hidden bg-[#EFEFD0]
        max-md:min-h-[calc(100vh-(var(--spacing)*32))] max-md:w-full
        md:h-screen md:flex-1 md:flex-row md:rounded-tl-[4rem]
      ">
        
        {/* LEFT SECTION: Hero Text & Description */}
        <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 flex-1">
          
          {/* Featured Work Title */}
          {/* Gap of 12 unitless (0.75rem / gap-3) */}
          <div className="flex flex-col items-start gap-3">
            {TEXT.TITLE.map((line, i) => (
              <h1
                key={i}
                // Size 160 unitless (10rem), -2.5% tracking
                className="bg-[#ECE9A7] px-2 font-figtree font-black text-[clamp(4rem,10vw,10rem)] leading-[0.85] tracking-[-0.025em] text-black"
              >
                {line}
              </h1>
            ))}
          </div>

          {/* Description Paragraph */}
          {/* Size 36 unitless (2.25rem), 2.5% tracking */}
          <div className="mt-12 md:mt-16 max-w-3xl">
            <p className="font-newsreader text-[1.5rem] md:text-[2.25rem] leading-[1.1] tracking-[0.025em] text-[#2F2F2B]">
              {TEXT.DESC}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: Highlighted Projects */}
        <div className="flex shrink-0 bg-[#EFEFD0] max-md:w-full max-md:flex-col md:h-full md:flex-row">
          {projects.map((project) => (
            <ProjectStrip key={project._id} project={project} />
          ))}
        </div>

      </main>
    </Section>
  );
}