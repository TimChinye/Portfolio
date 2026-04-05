"use client";

import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Theme } from "@/components/features/ThemeSwitcher/types";

export type Snapshots = null;

export function useThemeWipe() {
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
  };
}
