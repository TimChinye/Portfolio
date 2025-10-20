// src/components/ThemeSwitcher/index.tsx
"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useThemeWipe } from "./hooks/useThemeWipe";
import { ThemeToggleButtonIcon } from "./ui/ThemeToggleButtonIcon";
import { WipeAnimationOverlay } from "./ui/WipeAnimationOverlay";
import { Theme, WipeDirection } from "./types";
import type { MotionValue } from "motion/react";

type ThemeSwitcherProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
  setWipeDirection: Dispatch<SetStateAction<WipeDirection | null>>;
};

export function ThemeSwitcher({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { toggleTheme, screenshot, animationStyles } = useThemeWipe({
    wipeProgress,
    wipeDirection,
    setWipeDirection,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />;
  }

  const initialThemeForIcon = wipeDirection
    ? wipeDirection === "top-down"
      ? "light"
      : "dark"
    : (resolvedTheme as Theme);

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