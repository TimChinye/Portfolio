import React from "react";

/**
 * A disabled button shown while the theme switcher is mounting.
 */
export function LoadingButton() {
  return (
    <button
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
      aria-label="Loading Theme Switcher"
      disabled
      data-html2canvas-ignore="true"
    >
      Loading...
    </button>
  );
}