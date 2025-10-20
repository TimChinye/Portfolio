// src/components/ThemeSwitcher/ui/WipeAnimationOverlay.tsx
// src/components/ThemeSwitcher/ui/WipeAnimationOverlay.tsx
"use client";

import { motion, AnimatePresence, MotionValue } from "motion/react";

interface WipeAnimationOverlayProps {
  screenshot: string | null;
  animationStyles: {
    clipPath: MotionValue<string>;
    dividerTop: MotionValue<string>;
    dividerTranslate: string; // Updated: Added prop for translation
  };
}

/**
 * Renders the animated overlay and divider.
 * NOTE: All styles are kept inline in the `style` prop to ensure
 * the `motion` library can animate them without interference.
 */
export function WipeAnimationOverlay({
  screenshot,
  animationStyles: { clipPath, dividerTop, dividerTranslate }, // Updated: Destructure new prop
}: WipeAnimationOverlayProps) {
  return (
    <AnimatePresence>
      {screenshot && (
        <>
          <motion.div
            key="theme-switcher-overlay"
            data-html2canvas-ignore="true"
            className="fixed top-0 left-0 z-10000 h-screen w-screen pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `url(${screenshot})`,
              clipPath,
            }}
          />
          <motion.div
            key="theme-switcher-divider"
            data-html2canvas-ignore="true"
            className="fixed top-0 left-0 z-10000 h-1 w-full pointer-events-none bg-[#D9D24D]"
            style={{
              top: dividerTop,
              translate: dividerTranslate,
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}