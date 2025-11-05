"use client";

import { useEffect } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';

/**
 * An object containing MotionValues for all major mouse coordinate systems.
 */
export interface MousePosition {
  /** MotionValue for the mouse's X-coordinate relative to the viewport. */
  clientX: MotionValue<number>;
  /** MotionValue for the mouse's Y-coordinate relative to the viewport. */
  clientY: MotionValue<number>;
  /** MotionValue for the mouse's X-coordinate relative to the entire document. */
  pageX: MotionValue<number>;
  /** MotionValue for the mouse's Y-coordinate relative to the entire document. */
  pageY: MotionValue<number>;
  /** MotionValue for the mouse's X-coordinate relative to the user's screen. */
  screenX: MotionValue<number>;
  /** MotionValue for the mouse's Y-coordinate relative to the user's screen. */
  screenY: MotionValue<number>;
  /** MotionValue for the change in the mouse's X-coordinate since the last event. */
  movementX: MotionValue<number>;
  /** MotionValue for the change in the mouse's Y-coordinate since the last event. */
  movementY: MotionValue<number>;
}

/**
 * A hook to track the mouse position across different coordinate systems.
 * Returns an object of MotionValues for performance, preventing re-renders in the component using it.
 */
export const useMousePosition = (): MousePosition => {
  const clientX = useMotionValue(0);
  const clientY = useMotionValue(0);
  const pageX = useMotionValue(0);
  const pageY = useMotionValue(0);
  const screenX = useMotionValue(0);
  const screenY = useMotionValue(0);
  const movementX = useMotionValue(0);
  const movementY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      clientX.set(event.clientX);
      clientY.set(event.clientY);
      pageX.set(event.pageX);
      pageY.set(event.pageY);
      screenX.set(event.screenX);
      screenY.set(event.screenY);
      movementX.set(event.movementX);
      movementY.set(event.movementY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
    // The dependency array includes all MotionValues to adhere to React Hook linting rules.
    // In practice, useMotionValue returns a stable object, so this is primarily for correctness.
  }, [clientX, clientY, pageX, pageY, screenX, screenY, movementX, movementY]);

  return {
    clientX,
    clientY,
    pageX,
    pageY,
    screenX,
    screenY,
    movementX,
    movementY,
  };
};