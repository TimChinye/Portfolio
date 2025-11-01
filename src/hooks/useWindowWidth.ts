// src/hooks/useWindowWidth.ts
"use client";

import { useState, useEffect } from 'react';

const getWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 0);

/**
 * A hook to get the current width of the browser window.
 * It updates automatically whenever the window is resized.
 * @returns The current inner width of the window in pixels.
 */
export const useWindowWidth = (): number => {
  // Initialize state with the current window width, or 0 if on the server.
  const [width, setWidth] = useState(getWidth());

  useEffect(() => {
    // Handler to update state on resize.
    const handleResize = () => setWidth(getWidth());

    // Add event listener for window resize.
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener on component unmount.
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array ensures this effect runs only on mount and unmount.

  return width;
};