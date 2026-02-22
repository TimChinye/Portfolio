"use client";

import { useEffect } from "react";
import {
  animate,
  MotionValue,
  useTransform,
} from "motion/react";
import { Theme, WipeDirection } from "@/components/features/ThemeSwitcher/types";

interface UseWipeAnimationProps {
  animationTargetTheme: Theme | null;
  wipeDirection: WipeDirection | null;
  onAnimationComplete: () => void;
  onAnimationReturn: () => void;
  wipeProgress: MotionValue<number>;
}

/**
 * Manages the core animation logic for the theme transition wipe effect.
 * It returns motion values that can be directly applied to component styles.
 */
export function useWipeAnimation({
  animationTargetTheme,
  wipeDirection,
  onAnimationComplete,
  onAnimationReturn,
  wipeProgress,
}: UseWipeAnimationProps) {
  useEffect(() => {
    if (wipeDirection === null) return;

    const isWipeCompleting =
      (wipeDirection === "top-down" && animationTargetTheme === "dark") ||
      (wipeDirection === "bottom-up" && animationTargetTheme === "light");

    const animation = animate(wipeProgress, isWipeCompleting ? 100 : 0, {
      duration: 1.25,
      ease: [1, 0, 0.5, 1],
      onComplete: () => {
        if (isWipeCompleting) {
          onAnimationComplete();
        } else {
          onAnimationReturn();
        }
      },
    });

    return () => animation.stop();
  }, [animationTargetTheme, wipeDirection, wipeProgress, onAnimationComplete, onAnimationReturn]);

  // Transform the progress value into CSS properties.
  const clipPath = useTransform(wipeProgress, (p) => {
    if (wipeDirection === "top-down") return `inset(${p}% 0% 0% 0%)`;
    if (wipeDirection === "bottom-up") return `inset(0% 0% ${p}% 0%)`;
    return "inset(0% 0% 0% 0%)";
  });

  const dividerTop = useTransform(
    wipeProgress,
    [0, 100],
    wipeDirection === "top-down" ? ["0vh", "100vh"] : ["100vh", "0vh"]
  );

  // Sync to CSS variables for View Transition fallback
  useEffect(() => {
    return wipeProgress.on("change", (p) => {
      document.documentElement.style.setProperty("--wipe-progress", `${p}%`);
    });
  }, [wipeProgress]);

  return { clipPath, dividerTop, wipeProgress };
}