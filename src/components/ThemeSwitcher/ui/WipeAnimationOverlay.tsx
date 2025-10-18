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
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9998,
              pointerEvents: "none",
              backgroundImage: `url(${screenshot})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath,
            }}
          />
          <motion.div
            key="theme-switcher-divider"
            data-html2canvas-ignore="true"
            style={{
              position: "fixed",
              left: 0,
              width: "100%",
              height: "4px",
              zIndex: 9999,
              pointerEvents: "none",
              backgroundColor: "#D9D24D",
              top: dividerTop,
              translate: dividerTranslate, // Updated: Apply the dynamic translate value
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}