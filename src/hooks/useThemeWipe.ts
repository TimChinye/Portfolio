"use client";

import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { useTheme } from "next-themes";
import { domToPng } from "modern-screenshot";
import { getFullPageHTML } from "@/utils/dom-serializer";
import { useWipeAnimation } from "@/hooks/useWipeAnimation";
import { Theme, WipeDirection } from "@/components/features/ThemeSwitcher/types";
import type { MotionValue } from "motion/react";

// Global for developer overrides
if (typeof window !== "undefined") {
  (window as any).FORCE_FALLBACK = (window as any).FORCE_FALLBACK || {
    disablePuppeteer: false,
    disableModernScreenshot: false,
  };
}

type UseThemeWipeProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
  setWipeDirection: Dispatch<SetStateAction<WipeDirection | null>>;
};

export type Snapshots = {
  a: string; // Original theme
  b: string; // Target theme
  method?: string; // Debug info
};

export function useThemeWipe({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: UseThemeWipeProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [snapshots, setSnapshots] = useState<Snapshots | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Check warm-up status
    fetch("/api/snapshot")
      .then(() => setIsWarmingUp(false))
      .catch(() => setIsWarmingUp(false));
  }, []);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
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
    if (isWarmingUp) return;

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

    const fetchBatchedSnapshots = async (): Promise<[string, string]> => {
      const htmlA = getFullPageHTML();
      const htmlB = getFullPageHTML(newTheme);

      const payload = {
        tasks: [
          {
            html: htmlA,
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
          },
          {
            html: htmlB,
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
          }
        ]
      };

      const response = await fetch("/api/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.snapshots as [string, string];
    };

    const captureWithModernScreenshot = async (): Promise<Snapshots> => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const options = {
        useCORS: true,
        width: document.documentElement.clientWidth,
        height: vh,
        scale: Math.max(window.devicePixelRatio, 2),
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

      // 1. Snapshot A (current)
      const a = await domToPng(document.documentElement, options);

      // Mask switch
      setSnapshots({ a, b: a, method: 'modern-screenshot' });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 2. Switch theme
      setTheme(newTheme);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 3. Snapshot B (new)
      const b = await domToPng(document.documentElement, options);
      return { a, b, method: 'modern-screenshot' };
    };

    const withTimeout = (promise: Promise<any>, ms: number, errorMsg: string) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
      ]);
    };

    const forceFallback = (window as any).FORCE_FALLBACK || {};

    try {
      // PHASE 1: Try Puppeteer
      if (forceFallback.disablePuppeteer) throw new Error("Puppeteer manually disabled");

      console.log("Attempting Puppeteer batched snapshots...");
      const [snapshotA, snapshotB] = await withTimeout(
        fetchBatchedSnapshots(),
        10000, // Increased timeout to 10s for batched
        "Puppeteer timeout"
      );

      setSnapshots({ a: snapshotA, b: snapshotB, method: 'puppeteer' });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      setTheme(newTheme);
      setWipeDirection(direction);

    } catch (e: any) {
      console.warn("Puppeteer failed, falling back to modern-screenshot:", e.message);

      try {
        // PHASE 2: Try modern-screenshot
        if (forceFallback.disableModernScreenshot) throw new Error("Modern-screenshot manually disabled");

        const snapshots = await withTimeout(
          captureWithModernScreenshot(),
          7000, // Increased timeout
          "modern-screenshot timeout"
        ) as Snapshots;

        setSnapshots(snapshots);
        setWipeDirection(direction);

      } catch (e2: any) {
        console.warn("modern-screenshot failed, changing theme instantly:", e2.message);

        // PHASE 3: Fallback instantly
        setTheme(newTheme);
        setSnapshots(null);
        setScrollLock(false);
        setAnimationTargetTheme(null);
        setOriginalTheme(null);
        setWipeDirection(null);
        wipeProgress.set(0);
      }
    } finally {
      setIsCapturing(false);
      document.documentElement.classList.remove('disable-transitions');
    }
  }, [snapshots, isCapturing, isWarmingUp, resolvedTheme, setTheme, setWipeDirection, animationTargetTheme, wipeProgress]);

  return {
    toggleTheme,
    snapshots,
    isCapturing,
    isWarmingUp,
    originalTheme,
    animationStyles,
  };
}
