"use client";

import React from "react";

interface ThemeToggleButtonProps {
  onClick: () => void;
}

/**
 * The main button used to trigger the theme change.
 */
export function ThemeToggleButton({ onClick }: ThemeToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-[10000] px-4 py-2 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-md hover:bg-gray-400"
      aria-label="Toggle theme"
      data-html2canvas-ignore="true"
    >
      Toggle Theme
    </button>
  );
}