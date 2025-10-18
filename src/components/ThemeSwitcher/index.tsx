"use client";

import { useState, useEffect } from "react";
import { useThemeWipe } from "./hooks/useThemeWipe";
import { LoadingButton } from "./ui/LoadingButton";
import { ThemeToggleButton } from "./ui/ThemeToggleButton";
import { WipeAnimationOverlay } from "./ui/WipeAnimationOverlay";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { toggleTheme, screenshot, animationStyles } = useThemeWipe();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingButton />;
  }

  return (
    <>
      <ThemeToggleButton onClick={toggleTheme} />
      <WipeAnimationOverlay
        screenshot={screenshot}
        animationStyles={animationStyles}
      />
    </>
  );
}