"use client";

import { useEffect } from "react";
import {
  animate,
  MotionValue,
  useMotionValue,
  useTransform,
} from "motion/react";
import { Theme, WipeDirection } from "../types";

interface UseWipeAnimationProps {
  animationTargetTheme: Theme | null;
  wipeDirection: WipeDirection | null;
  onAnimationComplete: () => void;
}

/**
 * Manages the core animation logic for the theme transition wipe effect.
 * It returns motion values that can be directly applied to component styles.
 */
export function useWipeAnimation({
  animationTargetTheme,
  wipeDirection,
  onAnimationComplete,
}: UseWipeAnimationProps) {
  const wipeProgress = useMotionValue(0);

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
          wipeProgress.set(0);
        }
      },
    });

    return () => animation.stop();
  }, [animationTargetTheme, wipeDirection, wipeProgress, onAnimationComplete]);

  // Transform the progress value into CSS properties.
  const clipPath = useTransform(wipeProgress, (p) =>
    wipeDirection === "top-down"
      ? `inset(${p}% 0% 0% 0%)`
      : `inset(0% 0% ${p}% 0%)`
  );

  const dividerTop = useTransform(
    wipeProgress,
    [0, 100],
    wipeDirection === "top-down" ? ["0vh", "100vh"] : ["100vh", "0vh"]
  );

  // NEW LOGIC: Determine the translate value based on the wipe direction.
  const dividerTranslate = wipeDirection === "top-down" ? "0 -100%" : "0 0";

  return { clipPath, dividerTop, dividerTranslate };
}