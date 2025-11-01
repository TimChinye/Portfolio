// src/hooks/useMousePosition.ts
"use client";

import { useEffect } from 'react';
import { useMotionValue } from 'motion/react';

/**
 * A hook to track the mouse position relative to the document.
 * Returns a MotionValue for performance, preventing re-renders in the component using it.
 */
export const useMousePosition = () => {
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseY.set(event.pageY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseY]);

  return mouseY;
};