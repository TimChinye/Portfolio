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

/**
 * Creates a pruned clone of the document for optimized snapshotting.
 * It mimics the html/body structure using divs to avoid HierarchyRequestErrors,
 * and only deep-clones elements that are currently visible in the viewport.
 */
function getOptimizedClone() {
  const vh = window.innerHeight;
  const vw = document.documentElement.clientWidth;
  const scrollHeight = document.documentElement.scrollHeight;

  // Capture current computed styles to ensure the mock looks identical
  const htmlStyle = window.getComputedStyle(document.documentElement);
  const bodyStyle = window.getComputedStyle(document.body);

  // Create a container that mimics the document structure
  const rootMock = document.createElement("div");
  rootMock.id = "theme-wipe-optimized-root";
  rootMock.className = document.documentElement.className;

  // Replicate essential styles for correct theme rendering
  Object.assign(rootMock.style, {
    position: "absolute",
    top: "0",
    left: "-9999px", // Off-screen but in DOM for style computation
    width: `${vw}px`,
    height: `${scrollHeight}px`,
    zIndex: "-1000000",
    pointerEvents: "none",
    backgroundColor: htmlStyle.backgroundColor,
    color: htmlStyle.color,
    fontSize: htmlStyle.fontSize,
    fontFamily: htmlStyle.fontFamily,
  });

  const bodyMock = document.createElement("div");
  bodyMock.className = document.body.className;
  Object.assign(bodyMock.style, {
    backgroundColor: bodyStyle.backgroundColor,
    color: bodyStyle.color,
    minHeight: "100%",
  });
  rootMock.appendChild(bodyMock);

  // Prune direct children of body
  for (const child of Array.from(document.body.children)) {
    if (child.hasAttribute("data-html2canvas-ignore")) continue;
    if (child.id === "theme-wipe-optimized-root") continue;

    const rect = child.getBoundingClientRect();
    const isVisible = rect.bottom > 0 && rect.top < vh;

    if (isVisible) {
      bodyMock.appendChild(child.cloneNode(true));
    } else {
      // Placeholder to preserve layout and scroll position
      const placeholder = document.createElement(child.tagName);
      const className = child.getAttribute("class");
      if (className) placeholder.setAttribute("class", className);

      if (child instanceof HTMLElement || child instanceof SVGElement) {
        const pStyle = (placeholder as HTMLElement | SVGElement).style;
        pStyle.cssText = child.style.cssText;
        pStyle.height = `${rect.height}px`;
        pStyle.width = `${rect.width}px`;
        pStyle.visibility = "hidden";
      }
      bodyMock.appendChild(placeholder);
    }
  }

  return rootMock;
}

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

    // 3-second timeout for the snapshot process
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Snapshot timeout")), 3000)
    );

    try {
      const getCaptureOptions = () => {
        const vh = window.innerHeight;
        const scrollY = window.scrollY;

        return {
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
      };

      // 1. Capture current theme (with timeout)
      const rootA = getOptimizedClone();
      document.body.appendChild(rootA);
      const snapshotA = (await Promise.race([
        domToPng(rootA, getCaptureOptions()),
        timeoutPromise,
      ]).finally(() => {
        document.body.removeChild(rootA);
      })) as string;

      // Mask the theme change immediately to avoid the flash of the new theme
      setSnapshots({ a: snapshotA, b: snapshotA });
      // Ensure the overlay is rendered before we switch the underlying theme
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 2. Switch theme (Optimistic Change)
      setTheme(newTheme);

      // 3. Wait for the theme change to reflect in the DOM
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 4. Capture new theme (with timeout)
      const rootB = getOptimizedClone();
      document.body.appendChild(rootB);
      const snapshotB = (await Promise.race([
        domToPng(rootB, getCaptureOptions()),
        timeoutPromise,
      ]).finally(() => {
        document.body.removeChild(rootB);
      })) as string;

      setWipeDirection(direction);
      // We don't overwrite animationTargetTheme here because it might have been flipped mid-capture
      setSnapshots({ a: snapshotA, b: snapshotB });
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