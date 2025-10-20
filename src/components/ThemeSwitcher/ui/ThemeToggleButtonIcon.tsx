// src/components/ThemeSwitcher/ui/ThemeToggleButtonIcon.tsx
"use client";

import { motion, MotionValue, useTransform } from "motion/react";
import { Theme } from "../types";

type Props = {
  onClick: () => void;
  progress: MotionValue<number>;
  initialTheme: Theme;
};

export function ThemeToggleButtonIcon({ onClick, progress, initialTheme }: Props) {
  // Determine animation direction based on the theme when the transition started
  const isGoingToDark = initialTheme === 'light';

  // Create motion values that transform the 0-100 progress into CSS properties
  const svgRotate = useTransform(progress, [0, 100], isGoingToDark ? [40, 80] : [80, 40]);
  const moonMaskX = useTransform(progress, [0, 100], isGoingToDark ? [0, 15] : [15, 0]);
  const sunCircleScale = useTransform(progress, [0, 100], isGoingToDark ? [1, 0.55] : [0.55, 1]);
  const sunCircleRotate = useTransform(progress, [0, 100], isGoingToDark ? [0, 90] : [90, 0]);

  // FIX: Call `useTransform` at the top level for each sun ray.
  // This satisfies the Rules of Hooks by ensuring a consistent number of hook calls on every render.
  const sunRayScales = [
    useTransform(progress, isGoingToDark ? [50, 70] : [30, 50], isGoingToDark ? [0, 1] : [1, 0]),
    useTransform(progress, isGoingToDark ? [55, 75] : [25, 45], isGoingToDark ? [0, 1] : [1, 0]),
    useTransform(progress, isGoingToDark ? [60, 80] : [20, 40], isGoingToDark ? [0, 1] : [1, 0]),
    useTransform(progress, isGoingToDark ? [65, 85] : [15, 35], isGoingToDark ? [0, 1] : [1, 0]),
    useTransform(progress, isGoingToDark ? [70, 90] : [10, 30], isGoingToDark ? [0, 1] : [1, 0]),
    useTransform(progress, isGoingToDark ? [75, 95] : [5, 25], isGoingToDark ? [0, 1] : [1, 0]),
  ];

  return (
    <button
      onClick={onClick}
      className="relative h-8 w-8"
      aria-label="Toggle theme"
    >
      <motion.svg
        viewBox="0 0 18 18"
        className="h-full w-full overflow-visible  hover:text-[#948D00] hover:dark:text-[#D9D24D]"
        // Apply the transformed motion value directly to the style
        style={{ rotate: svgRotate }}
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="18" height="18" fill="white" />
          <motion.circle cx="10" cy="2" r="8" fill="black" style={{ x: moonMaskX }} />
        </mask>
        <motion.circle
          cx="9"
          cy="9"
          r="8"
          className="fill-current"
          mask="url(#moon-mask)"
          style={{ scale: sunCircleScale, rotate: sunCircleRotate }}
        />
        <g>
          {sunRayScales.map((scale, i) => (
             <motion.circle
              key={i}
              cx={9 + 8 * Math.cos(i * 60 * Math.PI / 180)}
              cy={9 + 8 * Math.sin(i * 60 * Math.PI / 180)}
              r="1.5"
              className="fill-current"
              style={{ scale }}
            />
          ))}
        </g>
      </motion.svg>
    </button>
  );
}