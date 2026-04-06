"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useTheme } from "next-themes";
import { useMotionValue, animate, MotionValue } from "motion/react";
import { useThemeWipe } from "../../../hooks/useThemeWipe";
import { ThemeToggleButtonIcon } from "./ui/ThemeToggleButtonIcon";
import { Theme } from "./types";

const ANIMATION_DURATION = 1.5;

const LoadingIcon = memo(() => (
  <span className="relative inline-block w-8 h-8 inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]" />
));
LoadingIcon.displayName = 'LoadingIcon';

const getRemainingDuration = (currentProgress: number, target: number): number => {
  const distance = Math.abs(target - currentProgress);
  const totalDistance = 100;
  return (distance / totalDistance) * ANIMATION_DURATION;
};

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  
  const animationRef = useRef<{ stop: () => void } | null>(null);

  const targetThemeRef = useRef<Theme | null>(null);

  const { resolvedTheme } = useTheme();
  
  const { toggleTheme, isCapturing } = useThemeWipe();
  
  const progress = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (resolvedTheme as Theme) || "light";

  useEffect(() => {
    if (mounted) {
      const newProgressValue = currentTheme === "dark" ? 100 : 0;
      progress.set(newProgressValue);
    }
  }, [mounted, currentTheme, progress]);

  const handleClick = useCallback(() => {
    // Stop any ongoing animation
    if (animationRef.current) {
      animationRef.current.stop();
      
      // Reverse direction: toggle the target
      const currentTarget = targetThemeRef.current;
      const reversedTarget = currentTarget === "dark" ? "light" : "dark";
      targetThemeRef.current = reversedTarget;
    } else {
      // No animation running - start new toward opposite theme
      const newTarget = currentTheme === "dark" ? "light" : "dark";
      targetThemeRef.current = newTarget;
    }

    const targetProgress = targetThemeRef.current === "dark" ? 100 : 0;
    const currentProgress = progress.get();
    const remainingDuration = getRemainingDuration(currentProgress, targetProgress);

    let hasToggled = false;
    
    animationRef.current = animate(progress, targetProgress, {
      duration: remainingDuration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (latest) => {
        // Toggle theme at 50% mark
        if (!hasToggled) {
          const startProgress = currentProgress;
          const target = targetProgress;
          const midpoint = (startProgress + target) / 2;
          
          // Check if we've crossed the midpoint
          const goingUp = target > startProgress;
          const crossedMidpoint = goingUp ? latest >= midpoint : latest <= midpoint;
          
          if (crossedMidpoint) {
            hasToggled = true;
            toggleTheme();
          }
        }
      },
      onComplete: () => {
        // Ensure theme is correct at end (in case we missed midpoint)
        if (!hasToggled) {
          toggleTheme();
        }
        animationRef.current = null;
        targetThemeRef.current = null;
      },
    });
  }, [toggleTheme, currentTheme, progress]);

  if (!mounted) {
    return <LoadingIcon />;
  }

  return (
    <>
      <ThemeToggleButtonIcon
        onClick={handleClick}
        progress={progress}
        isLoading={isCapturing}
      />
    </>
  );
}