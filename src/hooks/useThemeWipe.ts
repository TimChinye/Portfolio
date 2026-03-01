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

export type SnapshotMethod = "puppeteer" | "modern-screenshot" | "instant";

export type Snapshots = {
  a: string; // Original theme
  b: string; // Target theme
  method: SnapshotMethod;
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

    const fetchSnapshots = async (themes: (Theme | undefined)[]): Promise<string[]> => {
      const tasks = themes.map(theme => ({
        html: getFullPageHTML(theme),
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      }));

      const response = await fetch("/api/snapshot", {
        method: "POST",
        body: JSON.stringify({ tasks }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.snapshots;
    };

    const captureWithModernScreenshot = async (): Promise<{ a: string; b: string }> => {
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
      setSnapshots({ a, b: a, method: "modern-screenshot" });
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

    const forceFallback = typeof window !== 'undefined' ? (window as any).FORCE_FALLBACK || {} : {};

    const fallbackToInstant = () => {
      setTheme(newTheme);
      setSnapshots(null);
      setScrollLock(false);
      setAnimationTargetTheme(null);
      setOriginalTheme(null);
      setWipeDirection(null);
      wipeProgress.set(0);
      setIsCapturing(false);
      document.documentElement.classList.remove('disable-transitions');
    };

    const tryModernScreenshot = async () => {
      try {
        if (forceFallback.disableModernScreenshot) throw new Error("modern-screenshot manually disabled");
        console.log("Attempting modern-screenshot fallback...");
        const { a, b } = await withTimeout(
          captureWithModernScreenshot(),
          2000,
          "modern-screenshot timeout"
        ) as { a: string, b: string };

        setSnapshots({ a, b, method: "modern-screenshot" });
        setWipeDirection(direction);
        setTheme(newTheme); // Ensure theme actually switches!
      } catch (e) {
        console.warn("modern-screenshot failed, falling back to instant theme change:", e);
        fallbackToInstant();
      } finally {
        setIsCapturing(false);
        document.documentElement.classList.remove('disable-transitions');
      }
    };

    try {
      if (forceFallback.disablePuppeteer) throw new Error("Puppeteer manually disabled");

      // PHASE 1: Try Puppeteer (10s timeout)
      console.log("Attempting Puppeteer snapshots...");
      const results = await withTimeout(
        fetchSnapshots([undefined, newTheme]),
        10000,
        "Puppeteer timeout"
      );

      if (!results || !Array.isArray(results)) throw new Error("Invalid Puppeteer response");
      const [snapshotA, snapshotB] = results;

      setSnapshots({ a: snapshotA, b: snapshotB, method: "puppeteer" });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      setTheme(newTheme);
      setWipeDirection(direction);
      setIsCapturing(false);
      document.documentElement.classList.remove('disable-transitions');

    } catch (e: any) {
      console.warn("Puppeteer failed, falling back to modern-screenshot:", e.message);
      await tryModernScreenshot();
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
