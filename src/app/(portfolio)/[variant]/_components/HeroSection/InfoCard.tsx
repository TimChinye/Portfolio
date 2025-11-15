"use client";

import Image from 'next/image';
import { motion } from 'motion/react';
import { CustomLink as Link } from '@/components/ui/CustomLink';
import type { HeroProject } from '@/sanity/lib/queries';

type InfoCardProps = {
  project: HeroProject;
  onClose: () => void;
};

export function InfoCard({ project, onClose }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-4 right-4 md:top-6 md:right-6 w-[calc(100%-2rem)] max-w-sm p-4 rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-lg shadow-2xl z-50 border border-white/20 dark:border-black/20"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 size-8 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
        aria-label="Close project details"
      >
        ✕
      </button>

      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold font-newsreader pr-8">{project.title}</h3>
        <p className="text-sm text-black/70 dark:text-white/70">{project.shortDescription}</p>
        
        {project.techDescription && (
             <div className="text-xs text-black/60 dark:text-white/60 border-t border-black/10 dark:border-white/10 pt-2">
                <p className="whitespace-pre-line">{project.techDescription}</p>
             </div>
        )}

        <Link
          href={`/project/${project.slug.current}`}
          className="mt-2 inline-block px-4 py-2 rounded-lg bg-black/90 text-white text-center text-sm font-semibold transition hover:bg-black dark:bg-white/90 dark:text-black dark:hover:bg-white"
        >
          View Case Study
        </Link>
      </div>
    </motion.div>
  );
}