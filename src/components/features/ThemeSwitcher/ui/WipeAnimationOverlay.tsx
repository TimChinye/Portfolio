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
            className="absolute inset-0 bg-no-repeat bg-size-[100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.a})`,
            }}
          />

          {/* Status Text */}
          {snapshots.method && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[10001] bg-black/50 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
              Method: {snapshots.method}
            </div>
          )}

          {/* Target Theme Snapshot (Bottom Layer - Revealed) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-size-[100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.b})`,
            }}
          />

          {/* Original Theme Snapshot (Top Layer - Wiped Away) */}
          <motion.div
            key="theme-switcher-overlay"
            className="absolute inset-0 bg-no-repeat bg-size-[100%_100%]"
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
              translate: wipeDirection === "top-down" ? "0 -100%" : "0 0",
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}