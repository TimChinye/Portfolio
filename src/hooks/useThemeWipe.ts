"use client";

import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { domToCanvas } from "modern-screenshot";
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
  const pathname = usePathname();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [newScreenshot, setNewScreenshot] = useState<string | null>(null);
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Reset state on navigation to prevent being stuck in capturing state
  useEffect(() => {
    setIsCapturing(false);
    setScreenshot(null);
    setNewScreenshot(null);
    setScrollLock(false);
  }, [pathname]);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
  };

  const handleAnimationComplete = useCallback(() => {
    // Wait two frames to ensure the new theme is fully painted before removing overlay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setScreenshot(null);
        setNewScreenshot(null);
        setAnimationTargetTheme(null);
        setWipeDirection(null);
        setOriginalTheme(null);
        setScrollLock(false);
        setIsCapturing(false);
        wipeProgress.set(0);
      });
    });
  }, [setWipeDirection, wipeProgress]);

  const handleAnimationReturn = useCallback(() => {
    if (originalTheme) {
      setTheme(originalTheme);
    }
    setScreenshot(null);
    setNewScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setScrollLock(false);
    setIsCapturing(false);
    wipeProgress.set(0);
  }, [originalTheme, setTheme, setWipeDirection, wipeProgress]);

  const { ...animationStyles } = useWipeAnimation({
    animationTargetTheme,
    wipeDirection,
    onAnimationComplete: handleAnimationComplete,
    onAnimationReturn: handleAnimationReturn,
    wipeProgress,
  });

  const toggleTheme = useCallback(() => {
    // Reverse animation if already in progress
    if (screenshot && !isCapturing) {
      setAnimationTargetTheme((prev) => (prev === "dark" ? "light" : "dark"));
      return;
    }

    if (isCapturing) return;
    setIsCapturing(true);

    // Capture screenshot and start animation
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const scrollY = window.scrollY;

    const options = {
      width,
      height,
      style: {
        transform: `translateY(-${scrollY}px)`,
        transformOrigin: "top left",
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
      },
      filter: (node: Node) => {
        if (!(node instanceof HTMLElement)) return true;
        if (node.dataset.html2canvasIgnore === "true") return false;

        const tagName = node.tagName.toLowerCase();
        return tagName !== "video" && tagName !== "iframe";
      },
      scale: Math.max(window.devicePixelRatio, 2),
    };

    const captureWithTimeout = async () => {
      return Promise.race([
        domToCanvas(document.body, options),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Capture timeout")), 3500)
        )
      ]);
    };

    captureWithTimeout()
      .then(async (canvas) => {
        const oldDataUrl = canvas.toDataURL("image/png");

        // Wait for the image to be fully decoded
        const img = new Image();
        img.src = oldDataUrl;
        try {
          await img.decode();
        } catch (e) {
          console.warn("Old screenshot decoding failed:", e);
        }

        const currentTheme = resolvedTheme as Theme;
        const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
        const direction: WipeDirection =
          currentTheme === "dark" ? "bottom-up" : "top-down";

        setOriginalTheme(currentTheme);
        setScreenshot(oldDataUrl);

        // CRITICAL: Wait for the overlay to be painted with the old screenshot
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );

        // Disable scrolling and switch theme in DOM (hidden behind overlay)
        setScrollLock(true);
        setTheme(newTheme);

        // Wait for theme switch to settle and re-capture
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );

        try {
          const newCanvas = await captureWithTimeout();
          const newDataUrl = newCanvas.toDataURL("image/png");

          const newImg = new Image();
          newImg.src = newDataUrl;
          try {
            await newImg.decode();
          } catch (e) {
            console.warn("New screenshot decoding failed:", e);
          }

          setNewScreenshot(newDataUrl);
        } catch (e) {
          console.warn("New theme capture failed, falling back to live DOM reveal:", e);
        }

        setWipeDirection(direction);
        setAnimationTargetTheme(newTheme);
        setIsCapturing(false);
      })
      .catch((error) => {
        console.error("modern-screenshot failed:", error);

        // Fallback: switch theme without animation
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        setScreenshot(null);
        setNewScreenshot(null);
        setScrollLock(false);
        setIsCapturing(false);
      });
  }, [screenshot, isCapturing, resolvedTheme, setTheme, setWipeDirection]);

  return {
    toggleTheme,
    screenshot,
    newScreenshot,
    animationStyles,
  };
}