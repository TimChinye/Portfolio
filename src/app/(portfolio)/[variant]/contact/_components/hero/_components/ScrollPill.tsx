// src/app/(portfolio)/[variant]/contact/_components/ScrollPill.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'motion/react';
import { useMousePosition } from '@/hooks/useMousePosition';

type ScrollPillProps = {
  scrollProgress: MotionValue<number>;
};

// Distance from cursor center.
// 60px ensures it clears the 64px brush size comfortably.
const OFFSET = 60; 

export function ScrollPill({ scrollProgress }: ScrollPillProps) {
  const { clientX, clientY } = useMousePosition();
  
  // We need window dimensions to determine the "center" lines
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Smooth the cursor position (The "Magnet" effect)
  const cursorSpringConfig = { damping: 40, stiffness: 300, mass: 0.5 };
  const smoothCursorX = useSpring(clientX, cursorSpringConfig);
  const smoothCursorY = useSpring(clientY, cursorSpringConfig);

  // 2. Determine the Target Offset based on quadrant
  // If we are on the Left (val < center), we want to offset +OFFSET (Right).
  // If we are on the Right (val > center), we want to offset -OFFSET (Left).
  // Note: These transforms return the *instant* target value (e.g., 60 or -60).
  const targetOffsetX = useTransform(smoothCursorX, (v) => {
    if (dimensions.width === 0) return OFFSET;
    return v < dimensions.width / 2 ? OFFSET : -OFFSET;
  });

  const targetOffsetY = useTransform(smoothCursorY, (v) => {
    if (dimensions.height === 0) return OFFSET;
    return v < dimensions.height / 2 ? OFFSET : -OFFSET;
  });

  // 3. Smooth the Offset Change ("The Slide")
  // Instead of snapping from 60 to -60, we spring to it.
  // This makes the pill slide across the cursor when crossing the center lines.
  const offsetSpringConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothOffsetX = useSpring(targetOffsetX, offsetSpringConfig);
  const smoothOffsetY = useSpring(targetOffsetY, offsetSpringConfig);

  // 4. Combine Cursor Pos + Smoothed Offset
  const x = useTransform([smoothCursorX, smoothOffsetX], ([cx, ox]: number[]) => cx + ox);
  const y = useTransform([smoothCursorY, smoothOffsetY], ([cy, oy]: number[]) => cy + oy);

  // Fade out logic
  const opacity = useTransform(scrollProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollProgress, [0, 1], [1, 0.5]);

  return (
    <motion.div
      style={{ 
        x, 
        y,
        // Crucial: Center the element on its calculated coordinate.
        // This ensures the +60/-60 offset math is symmetrical regardless of text width.
        translateX: "-50%", 
        translateY: "-50%",
        opacity, 
        scale 
      }}
      className="fixed top-0 left-0 pointer-events-none z-999 bg-white text-black px-6 py-3 rounded-full font-figtree font-bold uppercase text-sm shadow-lg whitespace-nowrap"
    >
      Scroll Down
    </motion.div>
  );
}