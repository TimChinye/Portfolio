// src/hooks/useInView.ts
"use client";

import { useState, useEffect, type RefObject } from 'react';

/**
 * A hook to track if an element is visible in the viewport.
 * @param ref - A React ref attached to the element to observe.
 * @param options - Optional configuration for the IntersectionObserver.
 * @returns A boolean indicating if the element is currently in view.
 */
export const useInView = (
  ref: RefObject<HTMLElement | null>, 
  options: IntersectionObserverInit = {}
): boolean => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Ensure the ref is attached to an element.
    if (!ref.current) return;

    // Create an observer with a callback to update the state.
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    // Start observing the element.
    observer.observe(ref.current);

    // Cleanup function to stop observing when the component unmounts.
    return () => observer.disconnect();
  }, [ref, options]); // Re-run the effect if the ref or options change.

  return isInView;
};