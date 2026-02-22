"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { domToPng } from "modern-screenshot";
import { useWipeAnimation } from "@/hooks/useWipeAnimation";
import { Theme, WipeDirection } from "@/components/features/ThemeSwitcher/types";
import type { MotionValue } from "motion/react";

type UseThemeWipeProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
  setWipeDirection: Dispatch<SetStateAction<WipeDirection | null>>;
};

export type Snapshots = {
  a: string; // Original theme
  b: string; // Target theme
};

export function useThemeWipe({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: UseThemeWipeProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [snapshots, setSnapshots] = useState<Snapshots | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
  };

  const handleAnimationComplete = useCallback(() => {
    // Tiny delay to ensure the live page has fully rendered behind the snapshot
    setTimeout(() => {
      setSnapshots(null);
      setAnimationTargetTheme(null);
      setWipeDirection(null);
      setOriginalTheme(null);
      setScrollLock(false);
      wipeProgress.set(0);
    }, 50);
  }, [setWipeDirection, wipeProgress]);

  const handleAnimationReturn = useCallback(() => {
    if (originalTheme) {
      setTheme(originalTheme);
    }
    // Tiny delay to ensure the live page has fully rendered behind the snapshot
    setTimeout(() => {
      setSnapshots(null);
      setAnimationTargetTheme(null);
      setWipeDirection(null);
      setOriginalTheme(null);
      setScrollLock(false);
      wipeProgress.set(0);
    }, 50);
  }, [originalTheme, setTheme, setWipeDirection, wipeProgress]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    onAnimationReturn: handleAnimationReturn,
    wipeProgress,
  });

  const toggleTheme = useCallback(async () => {
    // Reverse animation if already in progress
    if (snapshots) {
      const nextTarget = animationTargetTheme === "dark" ? "light" : "dark";
      setAnimationTargetTheme(nextTarget);
      setTheme(nextTarget);
      return;
    }

    if (isCapturing) {
      const nextTarget = animationTargetTheme === "dark" ? "light" : "dark";
      setAnimationTargetTheme(nextTarget);
      setTheme(nextTarget);
      return;
    }

    setIsCapturing(true);
    setScrollLock(true); // Freeze the screen immediately

    try {
      const currentTheme = resolvedTheme as Theme;
      const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
      const direction: WipeDirection =
        currentTheme === "dark" ? "bottom-up" : "top-down";

      setOriginalTheme(currentTheme);
      setAnimationTargetTheme(newTheme);

      const captureOptions = {
        useCORS: true,
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
        scale: Math.max(window.devicePixelRatio, 2),
        filter: (node: Node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute('data-html2canvas-ignore')) return false;

            // Only capture what's visible in the viewport
            const rect = node.getBoundingClientRect();
            const buffer = 100; // Small buffer for safety
            return (
              rect.bottom >= -buffer &&
              rect.top <= window.innerHeight + buffer &&
              rect.right >= -buffer &&
              rect.left <= window.innerWidth + buffer
            );
          }
          return true;
        },
        style: {
          transform: `translateY(-${window.scrollY}px)`,
          transformOrigin: 'top left',
        }
      };

      // 1. Capture current theme
      const snapshotA = await domToPng(document.documentElement, captureOptions);

      // 2. Switch theme
      setTheme(newTheme);

      // 3. Wait for the theme change to reflect in the DOM
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 4. Capture new theme
      const snapshotB = await domToPng(document.documentElement, captureOptions);

      setWipeDirection(direction);
      // We don't overwrite animationTargetTheme here because it might have been flipped mid-capture
      setSnapshots({ a: snapshotA, b: snapshotB });
    } catch (error) {
      console.error("Theme wipe failed:", error);
      // Fallback
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      setSnapshots(null);
      setScrollLock(false);
    } finally {
      setIsCapturing(false);
    }
  }, [snapshots, isCapturing, resolvedTheme, setTheme, setWipeDirection, animationTargetTheme]);

  return {
    toggleTheme,
    snapshots,
    isCapturing,
    originalTheme,
    animationStyles,
  };
}