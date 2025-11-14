"use client";

import { Section, type SectionProps } from '@/components/ui/Section';
import { useRef, useState, useEffect } from 'react';

import { useBackgroundColourScroll } from '@/hooks/useBackgroundColourScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { Client } from './Client';

type WorkGraphicSectionProps = SectionProps<'section'>;

export const WorkGraphicSection = (props: WorkGraphicSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [endOffset, setEndOffset] = useState(1);

  useEffect(() => {
    if (sectionRef.current) {
      const wrapperElem = sectionRef.current;
      const sectionElem = wrapperElem.firstElementChild;
      if (!sectionElem) return;

      const viewportHeight = window.innerHeight;
      if (viewportHeight === 0) return; // Avoid division by zero
      
      const computedSectionElemStyle = window.getComputedStyle(sectionElem);
      const paddingTop = parseFloat(computedSectionElemStyle.paddingTop);

      setEndOffset(1 + (paddingTop / viewportHeight));

      console.log([endOffset, paddingTop / viewportHeight, paddingTop, viewportHeight, computedSectionElemStyle.paddingTop, sectionElem]);
    }
  }, []);

  const { style: animatedStyle } = useBackgroundColourScroll({
    target: sectionRef,
    endBgClasses: props.bgClasses ?? '',
    animationRange: ["0 1", `1 ${endOffset}`]
  });
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <Section
      {...props}
      ref={sectionRef}
      fillScreen={false}
      stickyDuration={isMobile ? "fit-content" : "200vh"}
      stickyAnimationRange={["0 1", "1 1"]}
      style={animatedStyle as React.CSSProperties}
    >
      <Client />
    </Section>
  );
};