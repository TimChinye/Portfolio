// src/components/ThemeSwitcher/index.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useThemeWipe } from "./hooks/useThemeWipe";
import { ThemeToggleButtonIcon } from "./ui/ThemeToggleButtonIcon";
import { WipeAnimationOverlay } from "./ui/WipeAnimationOverlay";
import { Theme } from "./types";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const {
    toggleTheme,
    screenshot,
    animationStyles,
    wipeProgress,
    wipeDirection,
  } = useThemeWipe();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />;
  }

  // Determine the theme at the start of the animation, or the current theme if idle.
  // This is crucial for the icon to know its starting point.
  const initialThemeForIcon = wipeDirection
    ? wipeDirection === 'top-down' ? 'light' : 'dark'
    : resolvedTheme as Theme;

  return (
    <>
      <ThemeToggleButtonIcon
        onClick={toggleTheme}
        progress={wipeProgress}
        initialTheme={initialThemeForIcon}
      />
      
      {createPortal(
        <WipeAnimationOverlay
          screenshot={screenshot}
          animationStyles={animationStyles}
        />,
        document.body
      )}
    </>
  );
}