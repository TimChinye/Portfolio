"use client";

import { useState, useEffect } from 'react';

const getWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 0);

/**
 * A hook to get the current width of the browser window.
 * It updates automatically whenever the window is resized.
 * @returns The current inner width of the window in pixels.
 */
export const useWindowWidth = (): number => {
  const [width, setWidth] = useState(getWidth());

  useEffect(() => {
    const handleResize = () => setWidth(getWidth());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};