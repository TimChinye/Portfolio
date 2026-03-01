"use client";

import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useThemeWipe } from "../../../hooks/useThemeWipe";
import { Settings } from "lucide-react";
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
  <span className=" relative inline-block w-8 h-8 inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-['']  after:absolute  after:inset-0  after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
);

export function ThemeSwitcher({
  wipeProgress,
  wipeDirection,
  setWipeDirection,
}: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  
  const { resolvedTheme } = useTheme();
  const { toggleTheme, snapshots, isCapturing, originalTheme, animationStyles } = useThemeWipe({
    wipeProgress,
    wipeDirection,
    setWipeDirection,
  });

  const [showDebug, setShowDebug] = useState(false);
  const [disabledMethods, setDisabledMethods] = useState({
    puppeteer: false,
    modernScreenshot: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).FORCE_FALLBACK = {
        disablePuppeteer: disabledMethods.puppeteer,
        disableModernScreenshot: disabledMethods.modernScreenshot,
      };
    }
  }, [disabledMethods]);

  useEffect(() => {
    setMounted(true);
    // Warm up the snapshot API on mount
    fetch("/api/snapshot").catch(() => {});
  }, []);

  if (!mounted) {
    return <LoadingIcon />;
  }

  const initialThemeForIcon = originalTheme || (resolvedTheme as Theme);

  return (
    <>
      <ThemeToggleButtonIcon
        onClick={toggleTheme}
        progress={wipeProgress}
        initialTheme={initialThemeForIcon}
        isLoading={isCapturing}
      />

      {createPortal(
        <WipeAnimationOverlay
          snapshots={snapshots}
          animationStyles={animationStyles}
          wipeDirection={wipeDirection}
        />,
        document.body
      )}

      {/* Dev Debug UI */}
      {process.env.NODE_ENV === "development" && createPortal(
        <div className="fixed bottom-24 right-4 z-[10001] flex flex-col items-end gap-2">
          {showDebug && (
            <div className="bg-white/95 dark:bg-black/95 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl backdrop-blur-md flex flex-col gap-3 text-sm font-sans min-w-[200px]">
              <div className="font-bold border-b border-neutral-100 dark:border-neutral-900 pb-2 mb-1">
                Theme Debug Controls
              </div>
              <label className="flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 p-1 rounded transition-colors">
                <span>Disable Puppeteer</span>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-yellow-400"
                  checked={disabledMethods.puppeteer}
                  onChange={(e) => setDisabledMethods(prev => ({ ...prev, puppeteer: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 p-1 rounded transition-colors">
                <span>Disable Modern-screenshot</span>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-yellow-400"
                  checked={disabledMethods.modernScreenshot}
                  onChange={(e) => setDisabledMethods(prev => ({ ...prev, modernScreenshot: e.target.checked }))}
                />
              </label>
            </div>
          )}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="p-3 bg-yellow-400 dark:bg-yellow-500 text-black rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
            title="Theme Debug Settings"
          >
            <Settings size={20} className={showDebug ? "rotate-45" : ""} />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}