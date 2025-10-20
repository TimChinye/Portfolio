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

const LoadingIcon = () => (
  <span className=" relative inline-block w-8 h-8 before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-['']  after:absolute  after:inset-0  after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
);

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
    return <LoadingIcon />;
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