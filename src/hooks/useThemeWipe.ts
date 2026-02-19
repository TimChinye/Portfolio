"use client";

import { useState, useCallback, Dispatch, SetStateAction, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import html2canvas from "html2canvas-pro";
import { useMotionValueEvent } from "motion/react";
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
  const transitionRef = useRef<any>(null);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
  };

  const handleCleanup = useCallback(() => {
    if (transitionRef.current) {
      transitionRef.current.skipTransition();
      transitionRef.current = null;
    }
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setScrollLock(false);
    document.documentElement.style.removeProperty('--wipe-clip-path');
    document.documentElement.style.removeProperty('--wipe-divider-top');
    document.documentElement.style.removeProperty('--wipe-divider-translate');
    document.documentElement.style.removeProperty('--wipe-divider-display');
  }, [setWipeDirection]);

  const handleAnimationComplete = useCallback(() => {
    handleCleanup();
  }, [handleCleanup]);

  const handleAnimationReturn = useCallback(() => {
    if (originalTheme) {
      flushSync(() => {
        setTheme(originalTheme);
      });
    }
    handleCleanup();
  }, [originalTheme, setTheme, handleCleanup]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    onAnimationReturn: handleAnimationReturn,
    wipeProgress,
  });

  const toggleTheme = useCallback(() => {
    // Reverse animation if already in progress
    if (screenshot || transitionRef.current) {
      setAnimationTargetTheme((prev) => (prev === "dark" ? "light" : "dark"));
      return;
    }

    const currentTheme = resolvedTheme as Theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    const direction: WipeDirection =
      currentTheme === "dark" ? "bottom-up" : "top-down";

    // Use View Transitions API if available
    if ((document as any).startViewTransition) {
      setScrollLock(true);
      setOriginalTheme(currentTheme);
      setAnimationTargetTheme(newTheme);

      flushSync(() => {
        setWipeDirection(direction);
      });

      transitionRef.current = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });

      return;
    }

    // Fallback: Capture screenshot and start animation
    html2canvas(document.documentElement, {
      useCORS: true,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: Math.max(window.devicePixelRatio, 2)
    })
    .then((canvas) => {
      setScrollLock(true); // Disable scrolling

      setOriginalTheme(currentTheme);
      setWipeDirection(direction);
      setAnimationTargetTheme(newTheme);
      setScreenshot(canvas.toDataURL());
      setTheme(newTheme);
    })
    .catch((error) => {
      console.error("html2canvas failed:", error);

      // Fallback: switch theme without animation
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      setScreenshot(null);
      setScrollLock(false);
    });
  }, [screenshot, resolvedTheme, setTheme, setWipeDirection]);

  useMotionValueEvent(wipeProgress, "change", (p) => {
    if (!wipeDirection) return;

    const cp =
      wipeDirection === "top-down"
        ? `inset(${p}% 0% 0% 0%)`
        : `inset(0% 0% ${p}% 0%)`;

    const dividerTop = wipeDirection === "top-down" ? `${p}vh` : `${100 - p}vh`;
    const dividerTranslate =
      wipeDirection === "top-down" ? "translateY(-100%)" : "translateY(0)";

    document.documentElement.style.setProperty("--wipe-clip-path", cp);
    document.documentElement.style.setProperty("--wipe-divider-top", dividerTop);
    document.documentElement.style.setProperty(
      "--wipe-divider-translate",
      dividerTranslate
    );
    document.documentElement.style.setProperty("--wipe-divider-display", "block");
  });

  return {
    toggleTheme,
    screenshot,
    animationStyles,
  };
}