"use client";

import { useState, useCallback, useRef, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { animate, MotionValue, useTransform } from "motion/react";
import { toPng } from "html-to-image";
import { flushSync } from "react-dom";
import { Theme, WipeDirection } from "@/components/features/ThemeSwitcher/types";

type TransitionStrategy = 'view-transition-wipe' | 'view-transition-cross-fade' | 'html-to-image';

// Configuration for strategy priority
const STRATEGY_PRIORITY: TransitionStrategy[] = ['view-transition-wipe', 'view-transition-cross-fade', 'html-to-image'];

type UseThemeTransitionProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
  setWipeDirection: Dispatch<SetStateAction<WipeDirection | null>>;
};

export function useThemeTransition({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: UseThemeTransitionProps) {
  const { setTheme, resolvedTheme } = useTheme();

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [animationTargetTheme, setAnimationTargetTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<TransitionStrategy | null>(null);

  const currentAnimation = useRef<any>(null);
  const activeTransition = useRef<any>(null);

  const setScrollLock = (isLocked: boolean) => {
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.scrollbarGutter = isLocked ? 'stable' : '';
  };

  const cleanup = useCallback(() => {
    setScreenshot(null);
    setAnimationTargetTheme(null);
    setWipeDirection(null);
    setOriginalTheme(null);
    setIsPreparing(false);
    setActiveStrategy(null);
    setScrollLock(false);

    if (activeTransition.current) {
      activeTransition.current.skipTransition();
      activeTransition.current = null;
    }

    document.documentElement.style.removeProperty('--wipe-progress');
    document.documentElement.style.removeProperty('--wipe-clip');
    document.documentElement.classList.remove('vt-wipe');
  }, [setWipeDirection]);

  const handleAnimationComplete = useCallback(() => {
    cleanup();
    wipeProgress.set(0);
  }, [cleanup, wipeProgress]);

  const handleAnimationReturn = useCallback(() => {
    if (originalTheme) {
      setTheme(originalTheme);
    }
    cleanup();
    wipeProgress.set(0);
  }, [originalTheme, setTheme, cleanup, wipeProgress]);

  const runAnimation = useCallback((toValue: number, direction: WipeDirection) => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
    }

    currentAnimation.current = animate(wipeProgress, toValue, {
      duration: 1.25,
      ease: [1, 0, 0.5, 1],
      onUpdate: (v) => {
        document.documentElement.style.setProperty('--wipe-progress', `${v}%`);
        if (direction === "top-down") {
          document.documentElement.style.setProperty('--wipe-clip', `inset(${v}% 0 0 0)`);
        } else {
          document.documentElement.style.setProperty('--wipe-clip', `inset(0 0 ${v}% 0)`);
        }
      },
      onComplete: () => {
        if (toValue === 100) {
          handleAnimationComplete();
        } else {
          handleAnimationReturn();
        }
      },
    });
  }, [wipeProgress, handleAnimationComplete, handleAnimationReturn]);

  const toggleTheme = useCallback(async () => {
    const currentTheme = resolvedTheme as Theme;
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    // Reversal logic
    if (animationTargetTheme && wipeDirection) {
      const isReversing = newTheme === originalTheme;
      setAnimationTargetTheme(newTheme);
      runAnimation(isReversing ? 0 : 100, wipeDirection);
      return;
    }

    setIsPreparing(true);

    // Decide strategy
    let strategy: TransitionStrategy = 'html-to-image';
    const supportsVT = typeof document !== 'undefined' && 'startViewTransition' in document;

    for (const s of STRATEGY_PRIORITY) {
      if (s.startsWith('view-transition') && supportsVT) {
        strategy = s;
        break;
      }
      if (s === 'html-to-image') {
        strategy = s;
        break;
      }
    }

    setActiveStrategy(strategy);
    setOriginalTheme(currentTheme);
    const direction: WipeDirection = currentTheme === "dark" ? "bottom-up" : "top-down";
    setWipeDirection(direction);

    if (strategy === 'html-to-image') {
      try {
        const dataUrl = await toPng(document.body, {
          cacheBust: true,
          width: window.innerWidth,
          height: window.innerHeight,
          style: {
            transform: 'none',
            marginTop: `-${window.scrollY}px`,
          },
          filter: (node) => {
             const isIgnored = (node as HTMLElement).dataset?.snapshotIgnore === 'true';
             return !isIgnored;
          }
        });

        setScreenshot(dataUrl);
        setIsPreparing(false);
        setScrollLock(true);
        setAnimationTargetTheme(newTheme);
        setTheme(newTheme);
        runAnimation(100, direction);
      } catch (error) {
        console.error("html-to-image failed:", error);
        setTheme(newTheme);
        cleanup();
      }
    } else if (strategy === 'view-transition-wipe') {
      setIsPreparing(false);
      setAnimationTargetTheme(newTheme);
      document.documentElement.classList.add('vt-wipe');

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });

      activeTransition.current = transition;

      transition.ready.then(() => {
        setScrollLock(true);
        runAnimation(100, direction);
      });

      transition.finished.finally(() => {
        activeTransition.current = null;
      });
    } else if (strategy === 'view-transition-cross-fade') {
      setIsPreparing(false);
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });

      animate(wipeProgress, 100, {
        duration: 0.5,
        onComplete: () => {
           cleanup();
           wipeProgress.set(0);
        }
      });
    }
  }, [resolvedTheme, animationTargetTheme, wipeDirection, originalTheme, runAnimation, setWipeDirection, setTheme, cleanup, wipeProgress]);

  // Transform values for the divider (shared between image and VT wipe)
  const dividerTop = useTransform(
    wipeProgress,
    [0, 100],
    wipeDirection === "top-down" ? ["0vh", "100vh"] : ["100vh", "0vh"]
  );

  const dividerTranslate = wipeDirection === "top-down" ? "0 -100%" : "0 0";

  // Clip path for image overlay strategy
  const clipPath = useTransform(wipeProgress, (p) =>
    wipeDirection === "top-down"
      ? `inset(${p}% 0% 0% 0%)`
      : `inset(0% 0% ${p}% 0%)`
  );

  return {
    toggleTheme,
    screenshot,
    isPreparing,
    animationStyles: {
      clipPath,
      dividerTop,
      dividerTranslate,
    },
    activeStrategy
  };
}
