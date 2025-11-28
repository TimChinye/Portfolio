"use client";

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';

import type { FeaturedProject } from '@/sanity/lib/queries';

import { ClingyButton } from './ClingyButton';
import { CustomLink as Link } from '@/components/ui/CustomLink';
import clsx from 'clsx';

type VerticalTrackProps = {
  projectSlug: string;
  className: string;
};

export function VerticalTrack({ projectSlug, className }: VerticalTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const buttonHeightRef = useRef(0);
  const cursorProgressY = useMotionValue(0.5);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const trackElement = trackRef.current;
      const buttonElement = buttonRef.current;
      
      if (!trackElement || !buttonElement) return;

      if (buttonHeightRef.current === 0) {
        buttonHeightRef.current = buttonElement.offsetHeight;
      }
      const buttonHeight = buttonHeightRef.current;
      
      const rect = trackElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(trackElement);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);

      const contentAreaTop = rect.top + paddingTop + (buttonHeight / 2);
      const contentAreaHeight = rect.height - paddingTop - paddingBottom - buttonHeight;

      if (contentAreaHeight <= 0) return;

      const mouseYRelativeToZone = e.clientY - contentAreaTop;
      let progress = mouseYRelativeToZone / contentAreaHeight;
      progress = Math.max(0, Math.min(1, progress));

      cursorProgressY.set(progress);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cursorProgressY]);

  const smoothProgressY = useSpring(cursorProgressY, {
    stiffness: 250,
    damping: 22.5,
    mass: 1,
  });

  const buttonY = useTransform(smoothProgressY, (v) => `calc(${v} * (100cqh - 100%))`);

  return (
    <div ref={trackRef} className={clsx("w-32 md:w-40 h-full container-size text-center", className)}>
      <motion.div
        style={{ y: buttonY }}
      >
        <Link href={`/project/${projectSlug}`}>
          <ClingyButton ref={buttonRef}>
            View Case Study
          </ClingyButton>
        </Link>
      </motion.div>
    </div>
  );
};