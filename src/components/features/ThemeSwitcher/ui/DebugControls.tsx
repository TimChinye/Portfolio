"use client";

import { useState, useEffect } from "react";

export function DebugControls() {
  const [show, setShow] = useState(false);
  const [puppeteerDisabled, setPuppeteerDisabled] = useState(false);
  const [modernScreenshotDisabled, setModernScreenshotDisabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).FORCE_FALLBACK = {
        puppeteer: puppeteerDisabled,
        modernScreenshot: modernScreenshotDisabled,
      };
    }
  }, [puppeteerDisabled, modernScreenshotDisabled]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-24 right-4 z-[99999]" data-html2canvas-ignore="true">
      {show && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[200px]">
          <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-white">Debug Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={puppeteerDisabled}
                onChange={(e) => setPuppeteerDisabled(e.target.checked)}
                className="size-4 rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                Disable Puppeteer
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={modernScreenshotDisabled}
                onChange={(e) => setModernScreenshotDisabled(e.target.checked)}
                className="size-4 rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                Disable modern-screenshot
              </span>
            </label>
          </div>
        </div>
      )}
      <button
        onClick={() => setShow(!show)}
        className="size-10 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        title="Toggle Debug Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      </button>
    </div>
  );
}
