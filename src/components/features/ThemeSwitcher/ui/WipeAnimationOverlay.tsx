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
  // Use the client width to ensure the snapshot matches the content area (excluding scrollbar)
  const contentWidth = typeof document !== 'undefined' ? `${document.documentElement.clientWidth}px` : '100%';

  return (
    <AnimatePresence>
      {snapshots && (
        <div
          className="fixed inset-0 z-10000"
          data-html2canvas-ignore="true"
        >
          {/* Debug Method Text */}
          <div className="absolute top-4 left-4 z-[10001] bg-black/50 text-white px-2 py-1 rounded text-xs font-mono">
            Method: {snapshots.method || 'unknown'}
          </div>

          {/* Target Theme Snapshot (Bottom Layer - Revealed) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-size-[100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.b})`,
              width: contentWidth,
            }}
          />

          {/* Original Theme Snapshot (Top Layer - Wiped Away) */}
          <motion.div
            key="theme-switcher-overlay"
            className="absolute inset-0 bg-no-repeat bg-size-[100%_100%]"
            style={{
              backgroundImage: `url(${snapshots.a})`,
              width: contentWidth,
              clipPath,
            }}
          />

          {/* Wipe Divider */}
          <motion.div
            key="theme-switcher-divider"
            className="absolute left-0 h-1 bg-[#D9D24D]"
            style={{
              top: dividerTop,
              width: contentWidth,
              translate: wipeDirection === "top-down" ? "0 -100%" : "0 0",
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
