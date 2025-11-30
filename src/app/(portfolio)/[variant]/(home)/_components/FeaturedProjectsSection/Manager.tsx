"use client";

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Section, type SectionProps } from '@/components/ui/Section';
import { Client } from './Client';
import type { FeaturedProject } from '@/sanity/lib/queries';

type ManagerProps = {
  projects: FeaturedProject[];
} & SectionProps<'section'>;

export function Manager({ projects, ...props }: ManagerProps) {
  const [stickyDuration, setStickyDuration] = useState('500vh');
  const [isMeasured, setIsMeasured] = useState(false);

  const handleDurationCalculated = useCallback((durationInPixels: number) => {
    setStickyDuration(`${durationInPixels}px`);
    setIsMeasured(true);
  }, []);

  return (
    <Section {...props} stickyDuration={stickyDuration}>
      {/* Prevent layout flash by hiding content until height calculation completes */}
      <motion.div
        className="h-full"
        animate={{ opacity: isMeasured ? 1 : 0 }}
        transition={{ duration: 0.75 }}
      >
        <Client
          projects={projects}
          onDurationCalculated={handleDurationCalculated}
        />
      </motion.div>
    </Section>
  );
}