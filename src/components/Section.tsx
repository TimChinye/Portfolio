// src/components/Section.tsx
"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionStyle } from 'motion/react';
import type { ReactNode } from 'react';

type AppearanceMode =
  | 'default' // Simple fade-in
  | 'parallax'
  | 'zoom-up'
  | 'zoom-down'
  | 'reverse-parallax'
  | 'radius-increase'
  | 'radius-decrease';

type SectionProps = {
  children: ReactNode;
  className?: string;
  bgColor: string;
  darkBgColor: string;
  textColor: string;
  darkTextColor: string;
  appearanceMode?: AppearanceMode;
  isFirst?: boolean;
  index: number;
};

export const Section = ({
  children,
  className = '',
  bgColor,
  darkBgColor,
  textColor,
  darkTextColor,
  appearanceMode = 'default',
  isFirst = false,
  index,
}: SectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Animate based on the section's visibility in the viewport.
  // "start end" means the animation starts when the top of the section hits the bottom of the viewport.
  // "end start" means the animation ends when the bottom of the section leaves the top of the viewport.
  // This gives us a full scroll-through animation duration.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // --- Animation Transforms for the ENTIRE SECTION ---
  const yParallax = useTransform(scrollYProgress, [0, 1], ['-20%', '0%']);
  const yReverseParallax = useTransform(scrollYProgress, [0, 1], ['20%', '0%']);
  const scaleZoomUp = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const scaleZoomDown = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]); // Fade in effect for all
  const radiusIncrease = useTransform(scrollYProgress, [0, 0.5], ['32rem', '6rem']); // Animate radius faster
  const radiusDecrease = useTransform(scrollYProgress, [0, 0.5], ['6rem', '32rem']);
  
  // --- Style Logic ---
  const motionStyle: MotionStyle = { opacity };

  switch (appearanceMode) {
    case 'parallax':
      motionStyle.y = yParallax;
      break;
    case 'reverse-parallax':
      motionStyle.y = yReverseParallax;
      break;
    case 'zoom-up':
      motionStyle.scale = scaleZoomUp;
      break;
    case 'zoom-down':
      motionStyle.scale = scaleZoomDown;
      break;
    case 'radius-increase':
      motionStyle.borderTopLeftRadius = radiusIncrease;
      motionStyle.borderTopRightRadius = radiusIncrease;
      // Note: Framer Motion doesn't support responsive styles directly in the `style` prop.
      // The initial responsive radius is set by Tailwind, and this animation will override it during scroll.
      break;
    case 'radius-decrease':
      motionStyle.borderTopLeftRadius = radiusDecrease;
      motionStyle.borderTopRightRadius = radiusDecrease;
      break;
  }

  const sectionClasses = `
    w-full min-h-screen relative flex flex-col items-center justify-center p-8 md:p-16
    ${bgColor} ${darkBgColor}
    ${textColor} ${darkTextColor}
    ${isFirst ? '' : '-mt-32 rounded-t-[6rem] md:rounded-t-[8rem]'}
    ${className}
  `;

  return (
    <motion.section
      ref={ref}
      className={sectionClasses}
      style={{ ...motionStyle, zIndex: index }}
    >
      {/* The inner div no longer needs animation styles. It's just a content container now. */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </motion.section>
  );
};