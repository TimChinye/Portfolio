"use client";

import { useEffect } from "react";
import {
  animate,
  MotionValue,
  useTransform,
  useMotionValueEvent,
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
          wipeProgress.set(0);
        } else {
          onAnimationReturn();
          // wipeProgress.set(0);
        }
      },
    });

    return () => animation.stop();
  }, [animationTargetTheme, wipeDirection, wipeProgress, onAnimationComplete, onAnimationReturn]);

  // Transform the progress value into CSS properties.
  const clipPath = useTransform(wipeProgress, (p) =>
    wipeDirection === "top-down"
      ? `inset(${p}% 0% 0% 0%)`
      : `inset(0% 0% ${p}% 0%)`
  );

  // Sync the clip-path to a CSS variable for the View Transitions API.
  // We use useMotionValueEvent to ensure the side-effect runs even if
  // the clipPath motion value isn't directly rendered in the DOM.
  useMotionValueEvent(wipeProgress, "change", (p) => {
    if (typeof document === "undefined" || !wipeDirection) return;

    const value =
      wipeDirection === "top-down"
        ? `inset(${p}% 0% 0% 0%)`
        : `inset(0% 0% ${p}% 0%)`;

    document.documentElement.style.setProperty("--wipe-clip-path", value);
  });

  const dividerTop = useTransform(
    wipeProgress,
    [0, 100],
    wipeDirection === "top-down" ? ["0vh", "100vh"] : ["100vh", "0vh"]
  );

  const dividerTranslate = wipeDirection === "top-down" ? "0 -100%" : "0 0";

  return { clipPath, dividerTop, dividerTranslate, wipeProgress };
}