"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { toPng } from "html-to-image";
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
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
  };

  const handleAnimationComplete = useCallback(() => {
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setScrollLock(false);
  }, [setWipeDirection]);

  const handleAnimationReturn = useCallback(() => {
    if (originalTheme) {
      setTheme(originalTheme);
    }
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setScrollLock(false);
  }, [originalTheme, setTheme, setWipeDirection]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    onAnimationReturn: handleAnimationReturn,
    wipeProgress,
  });

  const toggleTheme = useCallback(() => {
    // Reverse animation if already in progress
    if (screenshot) {
      setAnimationTargetTheme((prev) => (prev === "dark" ? "light" : "dark"));
      return;
    }

    // Capture screenshot and start animation
    toPng(document.documentElement, {
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translateY(-${window.scrollY}px)`,
        transformOrigin: "top left",
      },
      filter: (node) => {
        if (
          node instanceof HTMLElement &&
          node.dataset.html2canvasIgnore === "true"
        ) {
          return false;
        }
        return true;
      },
      pixelRatio: Math.max(window.devicePixelRatio, 2),
      cacheBust: true,
    })
      .then((dataUrl) => {
        setScrollLock(true); // Disable scrolling

        const currentTheme = resolvedTheme as Theme;
        const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
        const direction: WipeDirection =
          currentTheme === "dark" ? "bottom-up" : "top-down";

        setOriginalTheme(currentTheme);
        setWipeDirection(direction);
        setAnimationTargetTheme(newTheme);
        setScreenshot(dataUrl);
        setTheme(newTheme);
      })
      .catch((error) => {
        console.error("html-to-image failed:", error);

        // Fallback: switch theme without animation
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        setScreenshot(null);
        setScrollLock(false);
      });
  }, [screenshot, resolvedTheme, setTheme, setWipeDirection]);

  return {
    toggleTheme,
    screenshot,
    animationStyles,
  };
}