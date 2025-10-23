// src/components/PageTransition.tsx
"use client";

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { getPageIndex } from './Navbar/config';

const transition = { duration: 0.8, ease: [0.76, 0, 0.24, 1] } as const;

type PageTransitionProps = {
  children: React.ReactNode;
  isNotFound?: boolean;
};

export function PageTransition({ children, isNotFound = false }: PageTransitionProps) {
  const pathname = usePathname();
  const isInitialLoad = useRef(true);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // This effect runs once on mount to disable the initial load flag for subsequent navigations.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
    // We store the current path to be used as the 'previous' path on the *next* render.
    prevPathnameRef.current = pathname;
  }, [pathname]);


  // --- Determine navigation direction ---
  const prevIndex = getPageIndex(prevPathnameRef.current || '');
  const currentIndex = getPageIndex(pathname);
  let direction: 'forward' | 'backward' | 'none' = 'none';

  if (prevIndex !== -1 && currentIndex !== -1 && prevIndex !== currentIndex) {
    if (currentIndex > prevIndex) {
      direction = 'forward';
    } else {
      direction = 'backward';
    }
  }

  // --- Animation Definitions ---

  // Animation for the initial page load
  const initialLoadAnimation = {
    initial: { y: "0%" },
    animate: { y: "-100%" },
    transition: { ...transition }
  };

  // Animation for navigating FORWARD (e.g., Home -> About)
  const navigationForwardAnimation = {
    initial: { x: "-100%" },
    animate: { x: ["-100%", "0%", "100%"] }, // Enters from left, exits to right
    transition: { ...transition, times: [0, 0.5, 1] }
  };
  
  // Animation for navigating BACKWARD (e.g., Contact -> Home)
  const navigationBackwardAnimation = {
    initial: { x: "100%" },
    animate: { x: ["100%", "0%", "-100%"] }, // Enters from right, exits to left
    transition: { ...transition, times: [0, 0.5, 1] }
  };

  // Animation for the 404 page
  const notFoundAnimation = {
    initial: { y: "0%" },
    animate: { y: "100%" },
    transition: { ...transition }
  };

  // --- Select the appropriate animation based on the context ---
  let overlayAnimation;
  
  if (isNotFound) overlayAnimation = notFoundAnimation;
  else if (isInitialLoad.current) overlayAnimation = initialLoadAnimation;
  else if (direction === 'forward') overlayAnimation = navigationForwardAnimation;
  else if (direction === 'backward') overlayAnimation = navigationBackwardAnimation;
  else overlayAnimation = initialLoadAnimation;
  
  return (
    <div className="min-h-full">
      {/* --- OVERLAY --- */}
      <motion.div
        key={`${pathname}-transition-overlay`}
        className="fixed top-0 left-0 w-full h-screen bg-[#D9D24D] z-1000"
        {...overlayAnimation}
      />

      {/* --- PAGE CONTENT --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.4, duration: 0 } }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}