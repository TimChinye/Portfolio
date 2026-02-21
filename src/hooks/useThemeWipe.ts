"use client";

import { useState, useCallback, Dispatch, SetStateAction, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import html2canvas from "html2canvas-pro";
import { useWipeAnimation } from "@/hooks/useWipeAnimation";
import { Theme, WipeDirection } from "@/components/features/ThemeSwitcher/types";
import type { MotionValue } from "motion/react";

type UseThemeWipeProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
  setWipeDirection: Dispatch<SetStateAction<WipeDirection | null>>;
};

export function useThemeWipe({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: UseThemeWipeProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isNativeTransition, setIsNativeTransition] = useState(false);
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);
  const activeTransition = useRef<any>(null);
  const transitionResolver = useRef<(() => void) | null>(null);

  const setScrollLock = (isLocked: boolean) => {
    // For native transitions, we don't necessarily need to lock scroll,
    // but we do for the fallback to avoid alignment issues.
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
  };

  const handleAnimationComplete = useCallback(() => {
    setScreenshot(null);
    setIsNativeTransition(false);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setScrollLock(false);

    if (transitionResolver.current) {
      transitionResolver.current();
      transitionResolver.current = null;
    }
    activeTransition.current = null;
  }, [setWipeDirection]);

  const handleAnimationReturn = useCallback(() => {
    if (originalTheme) {
      setTheme(originalTheme);
    }
    setScreenshot(null);
    setIsNativeTransition(false);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setScrollLock(false);

    if (transitionResolver.current) {
      transitionResolver.current();
      transitionResolver.current = null;
    }
    activeTransition.current = null;
  }, [originalTheme, setTheme, setWipeDirection]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    onAnimationReturn: handleAnimationReturn,
    wipeProgress,
  });

  const toggleTheme = useCallback(() => {
    if (typeof document === "undefined") return;

    const currentTheme = resolvedTheme as Theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    // Reverse animation if already in progress
    if (screenshot || isNativeTransition) {
      setAnimationTargetTheme((prev) => (prev === "dark" ? "light" : "dark"));
      return;
    }

    // --- Primary Engine: View Transitions API ---
    const isNativeSupported = "startViewTransition" in document;
    if (isNativeSupported) {
      const direction: WipeDirection =
        currentTheme === "dark" ? "bottom-up" : "top-down";

      setOriginalTheme(currentTheme);
      setWipeDirection(direction);
      // Wait for the transition to be "ready" before starting the animation
      // We set the target theme to trigger the animate() in useWipeAnimation

      setScrollLock(true);
      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });

        // Return a promise that resolves only when the animation is complete.
        // This keeps the ::view-transition snapshots alive for the full wipe duration.
        return new Promise<void>((resolve) => {
          transitionResolver.current = resolve;
        });
      });

      activeTransition.current = transition;
      setIsNativeTransition(true);
      setAnimationTargetTheme(newTheme);

      return;
    }

    // --- Fallback Engine: html2canvas ---
    // Optimization: Capture only the viewport area and handle scale correctly
    html2canvas(document.documentElement, {
      useCORS: true,
      y: window.scrollY,
      x: window.scrollX,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: window.devicePixelRatio, // Match exact pixel ratio to avoid jumps
      logging: false,
      backgroundColor: null,
    })
    .then((canvas) => {
      setScrollLock(true);

      const direction: WipeDirection =
        currentTheme === "dark" ? "bottom-up" : "top-down";

      setOriginalTheme(currentTheme);
      setWipeDirection(direction);
      setAnimationTargetTheme(newTheme);
      setScreenshot(canvas.toDataURL());
      setTheme(newTheme);
    })
    .catch((error) => {
      console.error("Theme transition failed:", error);
      setTheme(newTheme);
      setScreenshot(null);
      setIsNativeTransition(false);
      setScrollLock(false);
    });
  }, [screenshot, isNativeTransition, resolvedTheme, setTheme, setWipeDirection]);

  return {
    toggleTheme,
    screenshot,
    animationStyles,
  };
}