"use client";

import { useRef } from 'react';
import { motion, useTransform, useSpring } from 'motion/react';
import { WorkLayer } from './WorkLayer';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useElementOffsets, useSectionScrollProgress } from '@/components/ui/Section';

const NUM_LAYERS = 24;

export function Client() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scrollYProgress = useSectionScrollProgress();
  let offsets = useElementOffsets(containerRef, true);

  const translateY = useTransform(
    scrollYProgress,
    [offsets[0], offsets[1] - 0.25],
    [0, 100],
    { clamp: true }
  );

  const smoothTranslateY = useSpring(translateY, {
    stiffness: 1000,
    damping: 100,
    mass: 1,
  });
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const verticalPadding = isMobile ? '3rem' : '4rem';

  const y = useTransform(
    translateY,
    (latestValue) => {
      const distance = `((100cqh - ${verticalPadding}) - 100%)`;
      return `calc(${latestValue / 100} * ${distance})`;
    }
  );

  return (
    <div
      ref={containerRef}
      className="pb-12 md:pb-16 px-[0.5em] md:px-[0.75em] text-[clamp(4rem,15vw,12rem)] relative flex h-full w-full flex-col justify-start"
    >
      <motion.div
        className="flex flex-col text-[clamp(4rem,20vw,24rem)] font-black leading-none"
        style={{ y }}
      >
        {[...Array(NUM_LAYERS)].map((_, index) => (
          <WorkLayer
            key={index}
            index={index}
            totalLayers={NUM_LAYERS}
            scrollYProgress={scrollYProgress}
            offsets={offsets}
          />
        ))}
      </motion.div>
    </div>
  );
}