"use client";

import { useState, useRef, useCallback, useLayoutEffect } from 'react';

export const useElementBounds = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState({ top: 0, bottom: 0 });
  
  // A hook to measure an element's position and dimensions relative to the document
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