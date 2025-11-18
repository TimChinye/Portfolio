// src/components/ThemeSwitcher/ui/ThemeToggleButtonIcon.tsx
"use client";

import { motion, MotionValue, useTransform } from "motion/react";
import { Theme } from "../types";

type Props = {
  onClick: () => void;
  progress: MotionValue<number>;
  initialTheme: Theme;
};

// Helper function to generate the animation parameters for a single sun ray.
// This function does NOT call any hooks itself.
const getRayTransformParams = (isGoingToDark: boolean, index: number): [number[], number[]] => {
  // Stagger the start of each ray's animation
  const darkRange: [number, number] = [50 + index * 5, 70 + index * 5];
  const lightRange: [number, number] = [30 - index * 5, 50 - index * 5];

  const inputRange = isGoingToDark ? darkRange : lightRange;
  const outputRange: [number, number] = isGoingToDark ? [0, 1] : [1, 0];
  
  return [inputRange, outputRange];
};

export function ThemeToggleButtonIcon({ onClick, progress, initialTheme }: Props) {
  const isGoingToDark = initialTheme === 'light';

  // Main hooks
  const svgRotate = useTransform(progress, [0, 100], isGoingToDark ? [40, 80] : [80, 40]);
  const moonMaskX = useTransform(progress, [0, 100], isGoingToDark ? [0, 15] : [15, 0]);
  const sunCircleScale = useTransform(progress, [0, 100], isGoingToDark ? [1, 0.55] : [0.55, 1]);
  const sunCircleRotate = useTransform(progress, [0, 100], isGoingToDark ? [0, 90] : [90, 0]);

  // Sun Ray Hooks
  // The six hook calls are still at the top level, satisfying the rules.
  // But the logic is now centralized in the helper function, satisfying DRY.
  const sunRayScales = [
    useTransform(progress, ...getRayTransformParams(isGoingToDark, 0)),
    useTransform(progress, ...getRayTransformParams(isGoingToDark, 1)),
    useTransform(progress, ...getRayTransformParams(isGoingToDark, 2)),
    useTransform(progress, ...getRayTransformParams(isGoingToDark, 3)),
    useTransform(progress, ...getRayTransformParams(isGoingToDark, 4)),
    useTransform(progress, ...getRayTransformParams(isGoingToDark, 5)),
  ];

  return (
    <button
      onClick={onClick}
      className="relative h-8 w-8 cursor-pointer"
      aria-label="Toggle theme"
    >
      <motion.svg
        viewBox="0 0 18 18"
        className="size-full overflow-visible hover:text-[#948D00] hover:dark:text-[#D9D24D]"
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