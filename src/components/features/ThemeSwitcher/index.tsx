"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useMotionValue, animate } from "motion/react";
import { useThemeWipe } from "../../../hooks/useThemeWipe";
import { ThemeToggleButtonIcon } from "./ui/ThemeToggleButtonIcon";
import { Theme } from "./types";

const LoadingIcon = () => (
  <span className=" relative inline-block w-8 h-8 inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-['']  after:absolute  after:inset-0  after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
);

const ANIMATION_DURATION = 1.5; // seconds

// Calculate remaining duration for smooth reversal
const getRemainingDuration = (currentProgress: number, target: number): number => {
  const distance = Math.abs(target - currentProgress);
  const totalDistance = 100;
  return (distance / totalDistance) * ANIMATION_DURATION;
};

export function ThemeSwitcher() {
  console.log("[ThemeSwitcher] Component render start");
  
  const [mounted, setMounted] = useState(false);
  console.log("[ThemeSwitcher] mounted state:", mounted);
  
  const animationRef = useRef<{ stop: () => void } | null>(null);
  console.log("[ThemeSwitcher] animationRef created");

  const targetThemeRef = useRef<Theme | null>(null);
  console.log("[ThemeSwitcher] targetThemeRef created");

  const { resolvedTheme } = useTheme();
  console.log("[ThemeSwitcher] resolvedTheme from useTheme:", resolvedTheme);
  
  const { toggleTheme, isCapturing, originalTheme } = useThemeWipe();
  console.log("[ThemeSwitcher] useThemeWipe returned:", { toggleTheme: typeof toggleTheme, isCapturing, originalTheme });
  
  const progress = useMotionValue(0);
  console.log("[ThemeSwitcher] progress MotionValue created with initial value 0");

  useEffect(() => {
    console.log("[ThemeSwitcher] MOUNT useEffect running - setting mounted to true");
    setMounted(true);
    console.log("[ThemeSwitcher] setMounted(true) called");
  }, []);

  const currentTheme = (resolvedTheme as Theme) || "light";
  console.log("[ThemeSwitcher] currentTheme computed:", currentTheme);

  useEffect(() => {
    console.log("[ThemeSwitcher] THEME CHANGE useEffect triggered");
    console.log("[ThemeSwitcher]   mounted:", mounted);
    console.log("[ThemeSwitcher]   currentTheme:", currentTheme);
    console.log("[ThemeSwitcher]   progress.get() before set:", progress.get());
    
    if (mounted) {
      const newProgressValue = currentTheme === "dark" ? 100 : 0;
      console.log("[ThemeSwitcher]   Setting progress to:", newProgressValue);
      progress.set(newProgressValue);
      console.log("[ThemeSwitcher]   progress.get() after set:", progress.get());
    } else {
      console.log("[ThemeSwitcher]   Not mounted yet, skipping progress set");
    }
  }, [mounted, currentTheme, progress]);

  const handleClick = useCallback(() => {
    console.log("[ThemeSwitcher] HANDLE CLICK START ========================");
    console.log("[ThemeSwitcher]   currentTheme at click:", currentTheme);
    console.log("[ThemeSwitcher]   progress.get() at click:", progress.get());
    console.log("[ThemeSwitcher]   animationRef.current exists:", !!animationRef.current);
    console.log("[ThemeSwitcher]   targetThemeRef.current:", targetThemeRef.current);
    
    // Stop any ongoing animation
    if (animationRef.current) {
      console.log("[ThemeSwitcher]   Stopping existing animation...");
      animationRef.current.stop();
      console.log("[ThemeSwitcher]   Existing animation stopped");
      console.log("[ThemeSwitcher]   progress.get() after stop:", progress.get());
      
      // Reverse direction: toggle the target
      const currentTarget = targetThemeRef.current;
      const reversedTarget = currentTarget === "dark" ? "light" : "dark";
      targetThemeRef.current = reversedTarget;
      console.log("[ThemeSwitcher]   Reversed target to:", reversedTarget);
    } else {
      // No animation running - start new toward opposite theme
      const newTarget = currentTheme === "dark" ? "light" : "dark";
      targetThemeRef.current = newTarget;
      console.log("[ThemeSwitcher]   New target:", newTarget);
    }

    const targetProgress = targetThemeRef.current === "dark" ? 100 : 0;
    const currentProgress = progress.get();
    const remainingDuration = getRemainingDuration(currentProgress, targetProgress);
    
    console.log("[ThemeSwitcher]   ANIMATION STARTING:");
    console.log("[ThemeSwitcher]     from:", currentProgress);
    console.log("[ThemeSwitcher]     to:", targetProgress);
    console.log("[ThemeSwitcher]     remainingDuration:", remainingDuration);

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
            console.log("[ThemeSwitcher]   MIDPOINT REACHED - toggling theme");
            toggleTheme();
            console.log("[ThemeSwitcher]   toggleTheme() called at progress:", latest);
          }
        }
      },
      onComplete: () => {
        console.log("[ThemeSwitcher]   ANIMATION COMPLETE - progress:", progress.get());
        // Ensure theme is correct at end (in case we missed midpoint)
        if (!hasToggled) {
          console.log("[ThemeSwitcher]   Toggling theme at completion (missed midpoint)");
          toggleTheme();
        }
        animationRef.current = null;
        targetThemeRef.current = null;
        console.log("[ThemeSwitcher]   animationRef and targetThemeRef reset");
      },
    });
    console.log("[ThemeSwitcher]   animate() called");
    console.log("[ThemeSwitcher] HANDLE CLICK END ========================");
  }, [toggleTheme, currentTheme, progress]);

  console.log("[ThemeSwitcher] Checking mounted:", mounted);
  if (!mounted) {
    console.log("[ThemeSwitcher] Not mounted, returning LoadingIcon");
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