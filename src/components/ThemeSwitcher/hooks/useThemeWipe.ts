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

  const handleAnimationComplete = useCallback(() => {
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
  }, [setWipeDirection]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    wipeProgress,
  });

  const toggleTheme = useCallback(() => {
    if (screenshot) {
      setAnimationTargetTheme((prev) => (prev === "dark" ? "light" : "dark"));
      return;
    }

    html2canvas(document.body, { useCORS: true })
      .then((canvas) => {
        const newTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
        const direction: WipeDirection =
          resolvedTheme === "dark" ? "bottom-up" : "top-down";

        setWipeDirection(direction);
        setAnimationTargetTheme(newTheme);
        setScreenshot(canvas.toDataURL());
        setTheme(newTheme);
      })
      .catch((error) => {
        console.error("html2canvas failed:", error);
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