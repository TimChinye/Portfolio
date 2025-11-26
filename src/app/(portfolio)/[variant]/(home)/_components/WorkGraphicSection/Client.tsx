"use client";

import { useRef, useState, useEffect } from 'react'; // Import useState and useEffect
import { motion, useTransform, useSpring } from 'motion/react';
import { WorkLayer } from './WorkLayer';

import { useSectionScrollProgress } from '@/components/ui/Section';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { KeyCap } from '@/components/ui/KeyCap';

const NUM_LAYERS = 24;

export function Client() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useSectionScrollProgress();

  const [startOffset, setStartOffset] = useState(0);
  const [endOffset, setEndOffset] = useState(1);

  useEffect(() => {
    if (containerRef.current) {
      const containerElem = containerRef.current;
      const sectionElem = containerElem.parentElement;

      if (!sectionElem) return;

      const containerHeight = containerElem.offsetHeight;
      
      // Avoid division by zero
      if (containerHeight === 0) return;
      
      const computedSectionElemStyle = window.getComputedStyle(sectionElem);
      const paddingTop = parseFloat(computedSectionElemStyle.paddingTop);
      
      const computedContainerElemStyle = window.getComputedStyle(containerElem);
      const paddingBottom = parseFloat(computedContainerElemStyle.paddingBottom);

      setStartOffset(paddingTop / containerHeight);
      setEndOffset(1 - (paddingBottom / containerHeight));
    }
  }, []);

  const innerScrollProgress = useTransform(
    scrollYProgress,
    [startOffset, endOffset - 0.1],
    [0, 1],
    { clamp: true }
  );

  const isMobile = useMediaQuery('(max-width: 768px)');
  const verticalPadding = isMobile ? '3rem' : '4rem';

  const translateToFit = useTransform(
    innerScrollProgress,
    (latestValue) => {
      const distance = `((100cqh - ${verticalPadding}) - 100%)`;
      return `calc(${latestValue} * ${distance})`;
    }
  );

  const slideIn = useTransform(
    innerScrollProgress,
    (latestValue) => `calc(${1 - latestValue} * (8rem + 100%))`
  );

  const slideInT = useTransform(
    innerScrollProgress,
    (latestValue) => `calc(${1 - latestValue} * (-8rem - 100%) * ${isMobile ? '2' : '1'})`
  );

  return (
    <div
      ref={containerRef}
      className="pb-12 md:pb-16 relative flex size-full flex-col justify-start"
    >
      <motion.div
        className="pointer-events-none z-1  flex flex-col text-[clamp(4rem,20vw,24rem)] font-black leading-none"
        style={{ y: translateToFit }}
      >
        {[...Array(NUM_LAYERS)].map((_, index) => (
          <WorkLayer
            key={index}
            index={index}
            totalLayers={NUM_LAYERS}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </motion.div>
      
      <motion.div
        style={{
          opacity: innerScrollProgress,
          x: slideIn,
          y: slideInT
        }}
        className="text-[0.25em] md:text-[0.25em] translate-x-1/2 absolute md:right-0 md:top-0 max-md:bottom-[calc(2.5*clamp(4rem,20vw,24rem))] max-md:-right-[1em]"
      >
        <div className="flex -space-x-[1em] -mb-[4.5em]">
          <KeyCap className="[&>text]:-translate-x-24 md:[&>text]:-translate-x-16 [&>text]:-translate-y-4">Space bar</KeyCap>
        </div>

        <div className="flex -space-x-[1em]">
          <KeyCap>L</KeyCap>
          <KeyCap className='mt-[0.625em]'>E</KeyCap>
          <KeyCap className='mt-[1.25em]'>T</KeyCap>
        </div>

        <div className="flex -space-x-[1em] -mt-[1.875em]">
          <KeyCap>U</KeyCap>
          <KeyCap className='mt-[0.625em]'>S</KeyCap>
        </div>
      </motion.div>
    </div>
  );
}