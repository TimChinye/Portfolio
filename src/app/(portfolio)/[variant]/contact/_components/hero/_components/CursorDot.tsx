"use client";

import { useEffect, useCallback } from 'react';
import { motion, useSpring, useTransform, MotionValue, useMotionValue } from 'motion/react';

type CursorDotProps = {
  size: number;
  color: string;
  scrollProgress: MotionValue<number>;
  externalX?: MotionValue<number>;
  externalY?: MotionValue<number>;
  isInPaintCanvasRef?: React.RefObject<boolean>;
};

export function CursorDot({ size, color, scrollProgress, externalX, externalY, isInPaintCanvasRef }: CursorDotProps) {
  // Internal position (always use this for spring input)
  const internalX = useMotionValue(0);
  const internalY = useMotionValue(0);

  // 1:1 tracking with spring
  const springConfig = { damping: 50, stiffness: 1000, mass: 0.1 };
  const x = useSpring(internalX, springConfig);
  const y = useSpring(internalY, springConfig);

  const opacity = useTransform(scrollProgress, [0, 1], [1, 0]);

  // Sync external position to internal (this is the key: external drives internal)
  useEffect(() => {
    if (!externalX) return;
    const unsubscribe = externalX.on("change", (latest) => {
      internalX.set(latest);
    });
    return () => unsubscribe();
  }, [externalX, internalX]);

  useEffect(() => {
    if (!externalY) return;
    const unsubscribe = externalY.on("change", (latest) => {
      internalY.set(latest);
    });
    return () => unsubscribe();
  }, [externalY, internalY]);

  // Mouse handler (desktop continuous tracking)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    internalX.set(e.clientX);
    internalY.set(e.clientY);
  }, [internalX, internalY]);

  // Touch handler - jump to position on tap (only when NOT in PaintCanvas text)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch && !isInPaintCanvasRef?.current) {
      internalX.set(touch.clientX);
      internalY.set(touch.clientY);
    }
  }, [internalX, internalY, isInPaintCanvasRef]);

  useEffect(() => {
    // Initialize to center
    if (typeof window !== 'undefined') {
      internalX.set(window.innerWidth / 2);
      internalY.set(window.innerHeight / 2);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleMouseMove, handleTouchStart, internalX, internalY]);

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