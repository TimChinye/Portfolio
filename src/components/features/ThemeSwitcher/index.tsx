"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useThemeWipe } from "../../../hooks/useThemeWipe";
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
  <span className="relative inline-block w-8 h-8 inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2a2 2 0 0 1-2 2a2 2 0 0 0-2 2a2 2 0 0 1-2 2a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2a2 2 0 0 1 2 2a2 2 0 0 0 2 2a2 2 0 0 1 2 2a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2a2 2 0 0 1 2-2a2 2 0 0 0 2-2a2 2 0 0 1 2-2a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2a2 2 0 0 1-2-2a2 2 0 0 0-2-2a2 2 0 0 1-2-2a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export function ThemeSwitcher({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [forceFallback, setForceFallback] = useState({
    disablePuppeteer: false,
    disableModernScreenshot: false,
  });

  const { resolvedTheme } = useTheme();
  const { toggleTheme, snapshots, isCapturing, isWarmingUp, originalTheme, animationStyles } = useThemeWipe({
    wipeProgress,
    wipeDirection,
    setWipeDirection,
  });

  useEffect(() => {
    setMounted(true);
    // Initialize global from state
    if (typeof window !== "undefined") {
      (window as any).FORCE_FALLBACK = forceFallback;
    }
  }, []);

  const updateFallback = (key: keyof typeof forceFallback, value: boolean) => {
    const newState = { ...forceFallback, [key]: value };
    setForceFallback(newState);
    if (typeof window !== "undefined") {
      (window as any).FORCE_FALLBACK = newState;
    }
  };

  if (!mounted) {
    return <LoadingIcon />;
  }

  const initialThemeForIcon = originalTheme || (resolvedTheme as Theme);

  return (
    <>
      <div className="relative flex items-center gap-2">
        <ThemeToggleButtonIcon
          onClick={toggleTheme}
          progress={wipeProgress}
          initialTheme={initialThemeForIcon}
          isLoading={isCapturing || isWarmingUp}
        />

        {/* Debug Toggle Button */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Theme Toggle Debug Settings"
        >
          <SettingsIcon />
        </button>
      </div>

      {showDebug && createPortal(
        <div className="fixed bottom-24 right-4 z-[20000] p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl text-xs space-y-3 min-w-[200px]">
          <h4 className="font-bold border-bottom pb-1 mb-2">Debug Settings</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceFallback.disablePuppeteer}
              onChange={(e) => updateFallback('disablePuppeteer', e.target.checked)}
            />
            Disable Puppeteer
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceFallback.disableModernScreenshot}
              onChange={(e) => updateFallback('disableModernScreenshot', e.target.checked)}
            />
            Disable Modern-Screenshot
          </label>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500">
            Current: {isWarmingUp ? 'Waking up...' : 'Ready'}
          </div>
        </div>,
        document.body
      )}

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
