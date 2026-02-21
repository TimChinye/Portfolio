"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { toCanvas } from "html-to-image";
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
    // Use requestAnimationFrame to ensure the theme has settled before removing overlay
    requestAnimationFrame(() => {
      setScreenshot(null);
      setAnimationTargetTheme(null);
      setWipeDirection(null);
      setOriginalTheme(null);
      setScrollLock(false);
    });
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
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const scrollY = window.scrollY;

    toCanvas(document.documentElement, {
      width,
      height,
      style: {
        transform: `translateY(-${scrollY}px)`,
        transformOrigin: "top left",
        width: `${width}px`,
        height: `${document.documentElement.scrollHeight}px`,
        overflow: "hidden",
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
      .then(async (canvas) => {
        const dataUrl = canvas.toDataURL("image/png");

        // Wait for the image to be fully decoded
        const img = new Image();
        img.src = dataUrl;
        try {
          await img.decode();
        } catch (e) {
          console.warn("Screenshot decoding failed:", e);
        }

        const currentTheme = resolvedTheme as Theme;
        const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
        const direction: WipeDirection =
          currentTheme === "dark" ? "bottom-up" : "top-down";

        setOriginalTheme(currentTheme);
        setWipeDirection(direction);
        setAnimationTargetTheme(newTheme);
        setScreenshot(dataUrl);

        // CRITICAL: Wait for at least two frames to ensure the overlay is
        // rendered and painted with the screenshot BEFORE switching the theme.
        // This prevents the "flash" where the new theme shows before the overlay.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        setScrollLock(true); // Disable scrolling
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