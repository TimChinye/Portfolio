"use client";

import { useState, useCallback, Dispatch, SetStateAction, useMemo } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
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
};

export function useThemeWipe({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: UseThemeWipeProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [snapshots, setSnapshots] = useState<Snapshots | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);

  const isPuppeteerPage = useMemo(() => {
    // We want to use Puppeteer ONLY on:
    // 1. Homepage: / or /tim or /tiger
    // 2. Projects listing: /projects or /tim/projects or /tiger/projects

    const parts = pathname.split('/').filter(Boolean);

    // Homepage: /
    if (parts.length === 0) return true;

    // /tim or /tiger or /projects
    if (parts.length === 1) {
      const p0 = parts[0];
      return p0 === 'tim' || p0 === 'tiger' || p0 === 'projects';
    }

    // /tim/projects or /tiger/projects
    if (parts.length === 2) {
      const [p0, p1] = parts;
      return (p0 === 'tim' || p0 === 'tiger') && p1 === 'projects';
    }

    return false;
  }, [pathname]);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
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
    const currentTheme = (resolvedTheme as Theme) || "light";
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    if (snapshots || isCapturing || wipeDirection) {
      const nextTarget = animationTargetTheme === "dark" ? "light" : "dark";
      setAnimationTargetTheme(nextTarget);
      return;
    }

    const captureMask = async () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const options = {
        useCORS: true,
        width: window.innerWidth,
        height: vh,
        scale: 1, // Low scale is fine for a temporary mask
        filter: (node: Node) => {
          if (node instanceof HTMLElement || node instanceof SVGElement) {
            if (node.hasAttribute('data-html2canvas-ignore')) return false;
          }
          return true;
        },
        style: {
          width: `${window.innerWidth}px`,
          height: `${document.documentElement.scrollHeight}px`,
          transform: `translateY(-${scrollY}px)`,
          transformOrigin: 'top left',
        }
      };
      return await domToPng(document.documentElement, options);
    };

    // PHASE 0: Capture Mask to prevent theme flash
    // We do this immediately before any React state changes to ensure a clean capture
    const mask = await captureMask();
    setSnapshots({ a: mask, b: mask, method: "Capturing..." });

    setIsCapturing(true);
    setScrollLock(true);
    document.documentElement.classList.add('disable-transitions');

    setOriginalTheme(currentTheme);
    setAnimationTargetTheme(newTheme);

    const direction: WipeDirection =
      currentTheme === "dark" ? "bottom-up" : "top-down";

    const fetchSnapshotsBatch = async (currentTheme: Theme, newTheme: Theme) => {
      // 1. Snapshot A (current)
      const htmlA = await getFullPageHTML(currentTheme);

      // 2. Switch theme (to handle layouts that require re-render)
      setTheme(newTheme);
      // Wait multiple frames and a small timeout to ensure all React components/effects have settled
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
      await new Promise(r => setTimeout(r, 250));

      // 3. Snapshot B (newly rendered theme)
      const htmlB = await getFullPageHTML(newTheme);

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
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.snapshots; // Array of [snapshotA, snapshotB]
    };

    const captureWithModernScreenshot = async (): Promise<Snapshots> => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const options = {
        useCORS: true,
        width: window.innerWidth,
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
          width: `${window.innerWidth}px`,
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

    try {
      if (isPuppeteerPage) {
        // PHASE 1: Try Puppeteer (20s timeout as per instructions)
        console.log("Attempting Puppeteer snapshot...");
        try {
          const [snapshotA, snapshotB] = await withTimeout(
            fetchSnapshotsBatch(currentTheme, newTheme),
            20000,
            "Puppeteer timeout"
          ) as [string, string];

          setSnapshots({ a: snapshotA, b: snapshotB, method: "Puppeteer" });
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          setTheme(newTheme);
          setWipeDirection(direction);
          return; // Exit on success
        } catch (e: any) {
          console.warn("Puppeteer failed or timed out, falling back to modern-screenshot:", e.message);
        }
      }

      try {
        // PHASE 2: Try modern-screenshot (15s timeout as per instructions)
        const snapshotsResult = await withTimeout(
          captureWithModernScreenshot(),
          15000,
          "modern-screenshot timeout"
        ) as Snapshots;

        setSnapshots({ ...snapshotsResult, method: "modern-screenshot" });
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
