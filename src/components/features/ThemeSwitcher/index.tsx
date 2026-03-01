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

      {/* Dev Debug UI - Moved back to bottom-right as requested */}
      {createPortal(
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
            className="p-3 bg-yellow-400 dark:bg-yellow-500 text-black rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
            title="Theme Debug Settings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${showDebug ? "rotate-45" : ""}`}
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
