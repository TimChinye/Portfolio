"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { domToPng } from "modern-screenshot";
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
  method?: string; // Method used for snapshot
  dimensions?: { width: number, height: number }; // Viewport dimensions when captured
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
    const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    // Only reserve gutter space if a scrollbar was actually present to prevent layout shift on mobile
    document.documentElement.style.scrollbarGutter = (isLocked && hasScrollbar) ? 'stable' : '';
  };

  const handleAnimationComplete = useCallback(() => {
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

    if (snapshots || isCapturing || wipeDirection) {
      const nextTarget = animationTargetTheme === "dark" ? "light" : "dark";
      setAnimationTargetTheme(nextTarget);
      return;
    }

    setIsCapturing(true);
    setScrollLock(true);
    document.documentElement.classList.add('disable-transitions');

    setOriginalTheme(currentTheme);
    setAnimationTargetTheme(newTheme);

    const direction: WipeDirection =
      currentTheme === "dark" ? "bottom-up" : "top-down";

    // Capture stable dimensions at the start of the process
    const dimensions = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };

    const captureMask = async () => {
      const vh = dimensions.height;
      const scrollY = window.scrollY;
      const options = {
        useCORS: true,
        width: dimensions.width,
        height: vh,
        scale: 1, // Low scale is fine for a temporary mask
        filter: (node: Node) => {
          if (node instanceof HTMLElement || node instanceof SVGElement) {
            if (node.hasAttribute('data-html2canvas-ignore')) return false;
          }
          return true;
        },
        style: {
          width: `${document.documentElement.clientWidth}px`,
          height: `${document.documentElement.scrollHeight}px`,
          transform: `translateY(-${scrollY}px)`,
          transformOrigin: 'top left',
        }
      };
      return await domToPng(document.documentElement, options);
    };

    const fetchSnapshotsBatch = async (newTheme: Theme) => {
      // 1. Snapshot A (current)
      const htmlA = await getFullPageHTML();

      // 2. Switch theme (to handle layouts that require re-render)
      setTheme(newTheme);
      // Wait multiple frames and a small timeout to ensure all React components/effects have settled
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
      await new Promise(r => setTimeout(r, 250));

      // 3. Snapshot B (newly rendered theme)
      const htmlB = await getFullPageHTML();

      // 4. Restore original theme state before sending to API
      // This ensures the live page matches Snapshot A when the wipe animation starts.
      setTheme(currentTheme);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      const response = await fetch("/api/snapshot", {
        method: "POST",
        body: JSON.stringify({
          tasks: [
            {
              html: htmlA,
              width: dimensions.width,
              height: dimensions.height,
              devicePixelRatio: window.devicePixelRatio,
            },
            {
              html: htmlB,
              width: dimensions.width,
              height: dimensions.height,
              devicePixelRatio: window.devicePixelRatio,
            }
          ]
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.snapshots; // Array of [snapshotA, snapshotB]
    };

    const captureWithModernScreenshot = async (): Promise<Snapshots> => {
      const vh = dimensions.height;
      const scrollY = window.scrollY;
      const options = {
        useCORS: true,
        width: dimensions.width,
        height: vh,
        scale: Math.max(window.devicePixelRatio, 2),
        // Force font rendering and asset loading delay for modern-screenshot too
        waitForFonts: true,
        filter: (node: Node) => {
          if (node instanceof HTMLElement || node instanceof SVGElement) {
            if (node.hasAttribute('data-html2canvas-ignore')) return false;
          }
          return true;
        },
        style: {
          width: `${dimensions.width}px`,
          height: `${document.documentElement.scrollHeight}px`,
          transform: `translateY(-${scrollY}px)`,
          transformOrigin: 'top left',
        }
      };

      // 1. Snapshot A (current)
      const a = await domToPng(document.documentElement, options);

      // Mask switch
      setSnapshots({ a, b: a });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 2. Switch theme
      setTheme(newTheme);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 3. Snapshot B (new)
      const b = await domToPng(document.documentElement, options);
      return { a, b };
    };

    const withTimeout = (promise: Promise<any>, ms: number, errorMsg: string) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
      ]);
    };

    const forceFallback = (window as any).FORCE_FALLBACK || {};

    try {
      // PHASE 0: Capture Mask to prevent theme flash
      const mask = await captureMask();
      setSnapshots({ a: mask, b: mask, method: "Capturing...", dimensions });

      if (forceFallback.puppeteer) {
        throw new Error("Puppeteer manually disabled");
      }
      // PHASE 1: Try Puppeteer (20s timeout as per instructions)
      console.log("Attempting Puppeteer snapshot...");
      const [snapshotA, snapshotB] = await withTimeout(
        fetchSnapshotsBatch(newTheme),
        20000,
        "Puppeteer timeout"
      ) as [string, string];

      setSnapshots({ a: snapshotA, b: snapshotB, method: "Puppeteer", dimensions });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      setTheme(newTheme);
      setWipeDirection(direction);

    } catch (e: any) {
      console.warn("Puppeteer failed or timed out, falling back to modern-screenshot:", e.message);

      try {
        if (forceFallback.modernScreenshot) {
          throw new Error("modern-screenshot manually disabled");
        }
        // PHASE 2: Try modern-screenshot (15s timeout as per instructions)
        const snapshotsResult = await withTimeout(
          captureWithModernScreenshot(),
          15000,
          "modern-screenshot timeout"
        ) as Snapshots;

        setSnapshots({ ...snapshotsResult, method: "modern-screenshot", dimensions });
        setWipeDirection(direction);

      } catch (e2: any) {
        // PHASE 3: Fallback instantly
        console.warn("modern-screenshot failed or timed out, changing theme instantly:", e2.message);
        setTheme(newTheme);
        setSnapshots({ a: '', b: '', method: 'Instant' });
        // Give it a moment to show the status before clearing
        setTimeout(() => {
          // Check if we haven't started a new capture in the meantime
          setSnapshots(prev => (prev?.method === 'Instant' ? null : prev));
          setScrollLock(false);
          setAnimationTargetTheme(prev => (prev === newTheme ? null : prev));
          setOriginalTheme(prev => (prev === currentTheme ? null : prev));
          setWipeDirection(prev => (prev === null ? null : prev)); // Don't clear if animation started
          wipeProgress.set(0);
        }, 2000);
      }
    } finally {
      setIsCapturing(false);
      document.documentElement.classList.remove('disable-transitions');
    }
  }, [snapshots, isCapturing, resolvedTheme, setTheme, setWipeDirection, animationTargetTheme, wipeProgress]);

  return {
    toggleTheme,
    snapshots,
    isCapturing,
    originalTheme,
    animationStyles,
  };
}
