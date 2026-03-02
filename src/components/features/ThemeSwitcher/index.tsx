"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useThemeWipe } from "../../../hooks/useThemeWipe";
import { ThemeToggleButtonIcon } from "./ui/ThemeToggleButtonIcon";
import { WipeAnimationOverlay } from "./ui/WipeAnimationOverlay";
import { DebugControls } from "./ui/DebugControls";
import { Theme, WipeDirection } from "./types";
import type { MotionValue } from "motion/react";

type ThemeSwitcherProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
  setWipeDirection: Dispatch<SetStateAction<WipeDirection | null>>;
};

const LoadingIcon = () => (
  <span className=" relative inline-block w-8 h-8 inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-['']  after:absolute  after:inset-0  after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
);

export function ThemeSwitcher({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  
  const { resolvedTheme } = useTheme();
  const { toggleTheme, snapshots, isCapturing, originalTheme, animationStyles } = useThemeWipe({
    wipeProgress,
    wipeDirection,
    setWipeDirection,
  });

  useEffect(() => {
    setMounted(true);
    // Warm up the snapshot API on mount
    setIsWarmingUp(true);
    fetch("/api/snapshot")
      .then(res => {
        if (!res.ok) throw new Error("Warmup failed");
        setIsWarmingUp(false);
      })
      .catch((err) => {
        console.error("Theme switcher warmup error:", err);
        // If warmup fails, we still unlock it so the user can try,
        // but it will likely fallback to modern-screenshot.
        setIsWarmingUp(false);
      });
  }, []);

  if (!mounted) {
    return <LoadingIcon />;
  }

  const initialThemeForIcon = originalTheme || (resolvedTheme as Theme);
  const isLoading = isCapturing || isWarmingUp;

  return (
    <>
      <ThemeToggleButtonIcon
        onClick={isLoading ? () => {} : toggleTheme}
        progress={wipeProgress}
        initialTheme={initialThemeForIcon}
        isLoading={isLoading}
      />

      <DebugControls />

      {createPortal(
        <WipeAnimationOverlay
          snapshots={snapshots}
          animationStyles={animationStyles}
          wipeDirection={wipeDirection}
        />,
        document.body
      )}
    </>
  );
}