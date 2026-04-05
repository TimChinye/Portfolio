"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemeWipe } from "../../../hooks/useThemeWipe";
import { ThemeToggleButtonIcon } from "./ui/ThemeToggleButtonIcon";
import { Theme } from "./types";

const LoadingIcon = () => (
  <span className=" relative inline-block w-8 h-8 inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-['']  after:absolute  after:inset-0  after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
);

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);

  const { resolvedTheme } = useTheme();
  const { toggleTheme, isCapturing, originalTheme } = useThemeWipe();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingIcon />;
  }

  const initialThemeForIcon = originalTheme || (resolvedTheme as Theme);

  return (
    <>
      <ThemeToggleButtonIcon
        onClick={toggleTheme}
        initialTheme={initialThemeForIcon}
        isLoading={isCapturing}
      />
    </>
  );
}