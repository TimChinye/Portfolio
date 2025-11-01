// src/hooks/useElementBounds.ts
"use client";

import { useState, useRef, useCallback, useLayoutEffect } from 'react';

/**
 * A hook to measure an element's position and dimensions relative to the document.
 * It updates on initial render and on window resize.
 */
export const useElementBounds = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState({ top: 0, bottom: 0 });

  const updateBounds = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setBounds({
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      });
    }
  }, []);

  useLayoutEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  return [ref, bounds] as const;
};