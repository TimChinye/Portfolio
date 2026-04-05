"use client";

import { motion, AnimatePresence, MotionValue } from "motion/react";
import type { Snapshots } from "@/hooks/useThemeWipe";
import { WipeDirection } from "../types";

interface WipeAnimationOverlayProps {
  snapshots: Snapshots | null;
  animationStyles: {
    clipPath: MotionValue<string>;
    dividerTop: MotionValue<string>;
  };
  wipeDirection: WipeDirection | null;
}

export function WipeAnimationOverlay({
  snapshots,
  animationStyles: { clipPath, dividerTop },
  wipeDirection,
}: WipeAnimationOverlayProps) {
  return (
    <AnimatePresence>
      {snapshots && (
        <div
          className="fixed inset-0 z-10000 pointer-events-none"
          data-html2canvas-ignore="true"
        >
          {/* Static Background Layer (to prevent target theme flash before wipe starts) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-top bg-[length:100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.a})`,
            }}
          />

          {/* Target Theme Snapshot (Bottom Layer - Revealed) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-top bg-[length:100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.b})`,
            }}
          />

          {/* Original Theme Snapshot (Top Layer - Wiped Away) */}
          <motion.div
            key="theme-switcher-overlay"
            className="absolute inset-0 bg-no-repeat bg-top bg-[length:100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.a})`,
              clipPath,
            }}
          />

          {/* Wipe Divider */}
          <motion.div
            key="theme-switcher-divider"
            className="absolute left-0 w-full h-1 bg-[#D9D24D]"
            style={{
              top: dividerTop,
              translate: "0 -50%",
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}