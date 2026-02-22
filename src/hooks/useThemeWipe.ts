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
    if (snapshots || isCapturing) {
      const nextTarget = animationTargetTheme === "dark" ? "light" : "dark";
      setAnimationTargetTheme(nextTarget);
      // Note: We do NOT call setTheme here. The theme was changed optimistically
      // and stays that way until the animation completes or returns.
      return;
    }

    setIsCapturing(true);
    setScrollLock(true); // Freeze the screen immediately

    const currentTheme = resolvedTheme as Theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    setOriginalTheme(currentTheme);
    setAnimationTargetTheme(newTheme);

    try {
      const direction: WipeDirection =
        currentTheme === "dark" ? "bottom-up" : "top-down";

      // Optimization: Identify elements outside the viewport to prune them during capture.
      // This significantly speeds up snapshotting on long pages by reducing the DOM size processed by modern-screenshot.
      const getOptimizedCaptureOptions = () => {
        const elementsToSkip = new Set<Node>();
        let shift = 0;
        const vh = window.innerHeight;
        const scrollY = window.scrollY;
        const buffer = 200;

        // Target direct children of the main content container to avoid double-counting and nesting issues.
        const mainContent = document.querySelector('.flex.flex-col') || document.body;
        const children = Array.from(mainContent.children);

        let firstVisibleChild = null;
        const parentRect = mainContent.getBoundingClientRect();

        for (const child of children) {
          if (!(child instanceof HTMLElement || child instanceof SVGElement)) continue;
          if (child.hasAttribute('data-html2canvas-ignore')) continue;

          const rect = child.getBoundingClientRect();

          // Entirely above viewport (with buffer)
          if (rect.bottom < -buffer) {
            elementsToSkip.add(child);
          }
          // At least partially visible or below
          else {
            if (!firstVisibleChild) {
              firstVisibleChild = child;
              // Calculate vertical shift: the distance from the container's top to this element's top.
              // When preceding siblings are pruned, this element will move up to the container's top.
              shift = rect.top - parentRect.top;
            }

            // Entirely below viewport (with buffer)
            if (rect.top > vh + buffer) {
              elementsToSkip.add(child);
            }
          }
        }

        return {
          useCORS: true,
          width: document.documentElement.clientWidth,
          height: vh,
          scale: Math.max(window.devicePixelRatio, 2),
          filter: (node: Node) => {
            if (elementsToSkip.has(node)) return false;
            if (node instanceof HTMLElement || node instanceof SVGElement) {
              if (node.hasAttribute('data-html2canvas-ignore')) return false;
            }
            return true;
          },
          style: {
            width: `${document.documentElement.clientWidth}px`,
            height: `${vh}px`,
            // Adjust the scroll position to compensate for the pruned content above the viewport.
            transform: `translateY(-${Math.max(0, scrollY - shift)}px)`,
            transformOrigin: 'top left',
            overflow: 'hidden',
          }
        };
      };

      // 1. Capture current theme
      const snapshotA = await domToPng(document.documentElement, getOptimizedCaptureOptions());

      // Mask the theme change immediately to avoid the flash of the new theme
      setSnapshots({ a: snapshotA, b: snapshotA });
      // Ensure the overlay is rendered before we switch the underlying theme
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 2. Switch theme (Optimistic Change)
      setTheme(newTheme);

      // 3. Wait for the theme change to reflect in the DOM
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 4. Capture new theme
      const snapshotB = await domToPng(document.documentElement, getOptimizedCaptureOptions());

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