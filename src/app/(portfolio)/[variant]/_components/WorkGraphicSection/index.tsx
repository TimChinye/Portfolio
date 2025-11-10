"use client";

import { Section, type SectionProps } from '@/components/ui/Section';
import { useRef } from 'react';
import { useBackgroundColourScroll } from '@/hooks/useBackgroundColourScroll';

import { Client } from './Client';

type WorkGraphicSectionProps = SectionProps<'section'>;

export const WorkGraphicSection = (props: WorkGraphicSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { style: animatedStyle } = useBackgroundColourScroll({
    target: sectionRef,
    endBgClasses: props.bgClasses ?? '',
  });

  return (
    <Section
      {...props}
      ref={sectionRef}
      stickyDuration="200vh"
      stickyAnimationRange={["0 1", "1 1"]}
      style={animatedStyle as React.CSSProperties}
    >
      <Client />
    </Section>
  );
};