// src/components/ThemeSwitcher/hooks/useThemeWipe.ts
"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import html2canvas from "html2canvas-pro";
import { useWipeAnimation } from "./useWipeAnimation";
import { Theme, WipeDirection } from "../types";
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
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(
    null
  );
  // --- ADDED: State to track the theme before the animation started ---
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);

  const handleAnimationComplete = useCallback(() => {
    // This callback handles a successful theme change completion.
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null); // Clean up state
  }, [setWipeDirection]);

  const handleAnimationReturn = useCallback(() => {
    // --- MODIFIED: This callback now correctly handles a "cancelled" theme change ---
    if (originalTheme) {
      setTheme(originalTheme); // Revert to the theme before the animation started.
    }
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null); // Clean up state
  }, [originalTheme, setTheme, setWipeDirection]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    onAnimationReturn: handleAnimationReturn,
    wipeProgress,
  });

  const toggleTheme = useCallback(() => {
    // If an animation is already in progress, this click is to "change mind" and reverse it.
    if (screenshot) {
      setAnimationTargetTheme((prev) => (prev === "dark" ? "light" : "dark"));
      return;
    }

    // This is the first click, starting the theme change process.
    html2canvas(document.documentElement, {
      useCORS: true,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: Math.max(window.devicePixelRatio, 2)
    })
      .then((canvas) => {
        const currentTheme = resolvedTheme as Theme;
        const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
        const direction: WipeDirection =
          currentTheme === "dark" ? "bottom-up" : "top-down";

        // --- MODIFIED: Store the original theme to enable reverting ---
        setOriginalTheme(currentTheme);
        setWipeDirection(direction);
        setAnimationTargetTheme(newTheme);
        setScreenshot(canvas.toDataURL());
        setTheme(newTheme); // Optimistically set the new theme.
      })
      .catch((error) => {
        console.error("html2canvas failed:", error);
        // Fallback: just switch the theme without the animation.
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        setScreenshot(null);
      });
  }, [screenshot, resolvedTheme, setTheme, setWipeDirection]);

  return {
    toggleTheme,
    screenshot,
    animationStyles,
  };
}