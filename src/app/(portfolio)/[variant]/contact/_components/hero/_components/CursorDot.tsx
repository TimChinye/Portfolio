"use client";

import { motion, useSpring, useTransform, MotionValue } from 'motion/react';
import { useMousePosition } from '@/hooks/useMousePosition';

type CursorDotProps = {
  size: number;
  color: string;
  scrollProgress: MotionValue<number>;
};

export function CursorDot({ size, color, scrollProgress }: CursorDotProps) {
  const { clientX, clientY } = useMousePosition();

  // 1:1 tracking
  // Very stiff spring just to smooth out sub-pixel jitter, but will feel instant.
  const springConfig = { damping: 50, stiffness: 1000, mass: 0.1 };
  const x = useSpring(clientX, springConfig);
  const y = useSpring(clientY, springConfig);

  const opacity = useTransform(scrollProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: color,
        x, 
        y,
        translate: '-50% -50%',
        opacity
      }}
      className="fixed top-0 left-0 z-999 pointer-events-none rounded-full"
    />
  );
}