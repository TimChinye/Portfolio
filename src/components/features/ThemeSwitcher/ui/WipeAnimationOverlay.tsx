"use client";

import { motion, AnimatePresence, MotionValue } from "motion/react";
import type { WipeDirection } from "../types";

interface WipeAnimationOverlayProps {
  screenshot: string | null;
  wipeDirection: WipeDirection | null;
  animationStyles: {
    clipPath: MotionValue<string>;
    dividerTop: MotionValue<string>;
    dividerTranslate: string;
  };
}

export function WipeAnimationOverlay({
  screenshot,
  wipeDirection,
  animationStyles: { clipPath, dividerTop, dividerTranslate },
}: WipeAnimationOverlayProps) {
  return (
    <AnimatePresence>
      {screenshot && (
        <motion.div
          key="theme-switcher-overlay"
          data-snapshot-ignore="true"
          className={`fixed top-0 left-0 z-10000 h-screen w-full pointer-events-none bg-size-[100%_100%]`}
          style={{
            backgroundImage: `url(${screenshot})`,
            clipPath,
          }}
          exit={{ opacity: 0 }}
        />
      )}
      {wipeDirection && (
        <motion.div
          key="theme-switcher-divider"
          data-snapshot-ignore="true"
          className="fixed top-0 left-0 z-100000 h-1 w-full pointer-events-none bg-[#D9D24D]"
          style={{
            top: dividerTop,
            translate: dividerTranslate,
            viewTransitionName: 'theme-divider'
          }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );
}