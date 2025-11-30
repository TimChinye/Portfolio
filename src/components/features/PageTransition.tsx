"use client";

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { getPageIndex } from '../shared/Navbar/config';

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
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }

    // We store the current path to be used as the 'previous' path on the *next* render.
    prevPathnameRef.current = pathname;
  }, [pathname]);


  // Determine navigation direction
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

  // Animation Definitions

  // Initial page load animation
  const initialLoadAnimation = {
    initial: { y: "0%" },
    animate: { y: "-100%" },
    transition: { ...transition }
  };

  // Forward
  const navigationForwardAnimation = {
    initial: { x: "-100%" },
    animate: { x: ["-100%", "0%", "100%"] }, // Enters from left, exits to right
    transition: { ...transition, times: [0, 0.5, 1] }
  };
  
  // Backward
  const navigationBackwardAnimation = {
    initial: { x: "100%" },
    animate: { x: ["100%", "0%", "-100%"] },
    transition: { ...transition, times: [0, 0.5, 1] }
  };

  // 404 page
  const notFoundAnimation = {
    initial: { y: "0%" },
    animate: { y: "100%" },
    transition: { ...transition }
  };

  let overlayAnimation;
  
  if (isNotFound) overlayAnimation = notFoundAnimation;
  else if (isInitialLoad.current) overlayAnimation = initialLoadAnimation;
  else if (direction === 'forward') overlayAnimation = navigationForwardAnimation;
  else if (direction === 'backward') overlayAnimation = navigationBackwardAnimation;
  else overlayAnimation = initialLoadAnimation;
  
  return (
    <div className="min-h-full">
      {/* Overlay */}
      <motion.div
        key={`${pathname}-transition-overlay`}
        className="fixed top-0 left-0 w-full h-screen bg-[#D9D24D] z-1000"
        {...overlayAnimation}
      />

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="min-h-screen content-center"
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