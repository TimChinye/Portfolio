// src/app/(portfolio)/[variant]/_components/FeaturedProjectsSection/Manager.tsx
"use client";

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Section, type SectionProps } from '@/components/ui/Section';
import { Client } from './Client';
import type { FeaturedProject } from '@/sanity/lib/queries';

type ManagerProps = {
  projects: FeaturedProject[];
} & SectionProps<'section'>;

export function Manager({ projects, ...sectionProps }: ManagerProps) {
  // State to hold the dynamically calculated height for the sticky container
  const [stickyDuration, setStickyDuration] = useState('500vh'); // Default large value
  // State to control the initial fade-in after measurement is complete
  const [isMeasured, setIsMeasured] = useState(false);

  // Callback for Client.tsx to report its calculated required height
  const handleDurationCalculated = useCallback((durationInPixels: number) => {
    // Set the precise height in pixels for the sticky container
    setStickyDuration(`${durationInPixels}px`);
    // Trigger the fade-in animation
    setIsMeasured(true);
  }, []);

  return (
    // This div handles the initial fade-in to hide the layout measurement
    <Section {...sectionProps} stickyDuration={stickyDuration}>
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