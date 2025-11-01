// src/components/ProgressBar/index.tsx
"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useAnimationControls } from 'motion/react';
import { progressBarEvents } from './events';
import { type NavigationDirection } from '../../shared/Navbar/config';

export function ProgressBar() {
  const controls = useAnimationControls();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // --- NProgress-like animation logic ---
    const handleStart = (direction: NavigationDirection = 'forward') => {
      // Reset any running animations and set initial state
      controls.stop();

      const initialStyles =
        direction === 'backward'
        ? { width: '0%', opacity: 1, left: 'auto', right: '0%' }
        : { width: '0%', opacity: 1, left: '0%', right: 'auto' };

      controls.set(initialStyles);

      // Start a long-running animation to 90%
      controls.start({
        width: '90%',
        transition: { duration: 10, ease: 'linear' },
      });
    };

    const handleFinish = () => {
      controls.stop();
      // Animate to 100% quickly, then fade out
      controls.start({
        width: '100%',
        transition: { duration: 0.2, ease: 'easeOut' },
      }).then(() => {
        controls.start({
          opacity: 0,
          transition: { delay: 0.2, duration: 0.3 },
        }).then(() => {
          // Reset width after fade out for the next navigation
          controls.set({ width: '0%' });
        });
      });
    };

    // --- Subscribe to custom events ---
    const unsubscribeStart = progressBarEvents.on('start', handleStart);
    const unsubscribeFinish = progressBarEvents.on('finish', handleFinish);

    // --- Detect route changes ---
    // This is the key to handling back/forward navigation
    if (pathname !== previousPathname.current) {
      previousPathname.current = pathname;
      handleFinish();
    }

    // --- Cleanup on unmount ---
    return () => {
      unsubscribeStart();
      unsubscribeFinish();
    };
  }, [pathname, controls]);

  return (
    <motion.div
      className="fixed top-0 h-[4px] bg-[#D9D24D] z-1000"
      initial={{ opacity: 0 }}
      animate={controls}
    />
  );
}