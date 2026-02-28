"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { getFullPageHTML } from "@/utils/dom-serializer";
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
    const currentTheme = resolvedTheme as Theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    // Reverse animation if already in progress
    if (snapshots || isCapturing || wipeDirection) {
      const nextTarget = animationTargetTheme === "dark" ? "light" : "dark";
      setAnimationTargetTheme(nextTarget);
      return;
    }

    setIsCapturing(true);
    setScrollLock(true); // Freeze the screen immediately
    document.documentElement.classList.add('disable-transitions');

    setOriginalTheme(currentTheme);
    setAnimationTargetTheme(newTheme);

    const direction: WipeDirection =
      currentTheme === "dark" ? "bottom-up" : "top-down";

    const fetchSnapshot = async (themeOverride?: "light" | "dark") => {
      const html = getFullPageHTML(themeOverride);
      const response = await fetch("/api/snapshot", {
        method: "POST",
        body: JSON.stringify({
          html,
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.snapshot;
    };

    const withTimeout = (promise: Promise<any>, ms: number) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Snapshot timeout")), ms))
      ]);
    };

    try {
      // 1. Capture both themes in parallel immediately
      const [snapshotA, snapshotB] = await withTimeout(
        Promise.all([
          fetchSnapshot(), // Current theme
          fetchSnapshot(newTheme) // Target theme
        ]),
        7000 // Slightly longer timeout for parallel requests
      ) as [string, string];

      // 2. Set the snapshots to start the overlay rendering
      // We mask the change by showing Snapshot A as both A and B for a single frame if needed,
      // but since we have both, we can just set them and switch theme.
      setSnapshots({ a: snapshotA, b: snapshotB });

      // Ensure the overlay is rendered before we switch the underlying theme
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 3. Switch theme (Optimistic Change)
      setTheme(newTheme);

      // 4. Start the wipe animation
      setWipeDirection(direction);
    } catch (error) {
      console.warn("Theme wipe snapshot failed or timed out, changing theme instantly:", error);

      // Fallback: switch theme instantly without animation
      setTheme(newTheme);
      setSnapshots(null);
      setScrollLock(false);
      setAnimationTargetTheme(null);
      setOriginalTheme(null);
      setWipeDirection(null);
      wipeProgress.set(0);
    } finally {
      setIsCapturing(false);
      document.documentElement.classList.remove('disable-transitions');
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