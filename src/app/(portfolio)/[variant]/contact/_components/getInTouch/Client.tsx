"use client";

import { motion, useTransform } from 'motion/react';
import { useSectionScrollProgress } from '@/components/ui/Section';
import { Graphic } from './Graphic';

// --- CONFIGURATION ---
const SHADOW_COUNT = 3;
const SHADOW_OFFSET = 14; // The 44px offset from your Figma design
// --- END CONFIGURATION ---

export function Client() {
  const scrollYProgress = useSectionScrollProgress();

  const shadowTransforms = Array.from({ length: SHADOW_COUNT }).map((_, i) => {
    const start = 0.1 + i * 0.1;
    const end = 0.4 + i * 0.1;
    const finalY = SHADOW_OFFSET * (i + 1);
    return useTransform(scrollYProgress, [start, end], ['0%', `${finalY}%`], { clamp: true });
  });

  return (
    <div className="relative w-full flex items-center justify-center p-8 -translate-y-16">
      {/* Layer 1: Base Stroke (Static) */}
      <div className="absolute z-10 w-full">
        <Graphic
          fillClassName="fill-transparent"
          strokeClassName="stroke-black dark:stroke-white"
        />
      </div>

      {/* Layer 2: Animated Shadows */}
      {shadowTransforms.map((y, i) => (
        <motion.div
          key={i}
          className="absolute w-full"
          style={{
            y,
            // CORRECTED: Reverse the z-index so the first shadow (i=0) is on top.
            zIndex: 20 + (SHADOW_COUNT - 1 - i),
          }}
        >
          <Graphic
            fillClassName="fill-[#F5F5EF] dark:fill-[#1A1A17]"
            strokeClassName="stroke-black dark:stroke-white"
          />
        </motion.div>
      ))}
      
      {/* Layer 3: Top Solid Text */}
      <div className="absolute z-50 w-full">
        <Graphic
          fillClassName="fill-black dark:fill-white"
          strokeClassName="stroke-black dark:stroke-white"
        />
      </div>
    </div>
  );
}