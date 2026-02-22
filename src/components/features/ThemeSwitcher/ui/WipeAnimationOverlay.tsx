"use client";

import { motion, AnimatePresence, MotionValue } from "motion/react";
import type { WipeDirection } from "../types";

interface WipeAnimationOverlayProps {
  screenshot: string | null;
  newScreenshot?: string | null;
  wipeDirection: WipeDirection | null;
  animationStyles: {
    clipPath: MotionValue<string>;
    dividerTop: MotionValue<string>;
    dividerTranslate: string;
  };
}

export function WipeAnimationOverlay({
  screenshot,
  newScreenshot,
  animationStyles: { clipPath, dividerTop, dividerTranslate },
}: WipeAnimationOverlayProps) {
  return (
    <AnimatePresence>
      {screenshot && (
        <>
          {newScreenshot && (
            <motion.div
              key="theme-switcher-new-overlay"
              data-html2canvas-ignore="true"
              className="fixed inset-0 z-9999 h-screen w-full pointer-events-none bg-[size:100%_100%]"
              style={{
                backgroundImage: `url(${newScreenshot})`,
              }}
            />
          )}
          <motion.div
            key="theme-switcher-overlay"
            data-html2canvas-ignore="true"
            className={`fixed top-0 left-0 z-10000 h-screen w-full pointer-events-none bg-[size:100%_100%]`}
            style={{
              backgroundImage: `url(${screenshot})`,
              clipPath,
            }}
          />
          <motion.div
            key="theme-switcher-divider"
            data-html2canvas-ignore="true"
            className="fixed top-0 left-0 z-10001 h-1 w-full pointer-events-none bg-[#D9D24D]"
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