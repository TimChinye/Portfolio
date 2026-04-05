"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { Theme } from "@/components/features/ThemeSwitcher/types";
import type { MotionValue } from "motion/react";

type UseThemeWipeProps = {
  wipeProgress: MotionValue<number>;
  wipeDirection: null;
  setWipeDirection: Dispatch<SetStateAction<null>>;
};

export type Snapshots = null;

export function useThemeWipe({
  wipeProgress,
}: UseThemeWipeProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleTheme = useCallback(async () => {
    const currentTheme = (resolvedTheme as Theme) || "light";
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    setIsCapturing(true);
    setTheme(newTheme);
    setIsCapturing(false);
  }, [resolvedTheme, setTheme]);

  return {
    toggleTheme,
    snapshots: null as Snapshots,
    isCapturing,
    originalTheme: null,
    animationStyles: {
      clipPath: wipeProgress.get(),
      dividerTop: wipeProgress.get(),
    },
  };
}
