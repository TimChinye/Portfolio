// src/components/features/ThemeSwitcher/ui/ThemeToggleButtonIcon.tsx
"use client";

import { memo } from "react";
import { motion, MotionValue, useTransform } from "motion/react";

type Props = {
  onClick: () => void;
  progress?: MotionValue<number>;
  isLoading?: boolean;
};

// Static ray mapping: rays fade out as progress goes 0 (Moon) → 100 (Sun)
const getRayTransformParams = (index: number): [number[], number[]] => {
  const start = 30 + index * 5;
  const end = 50 + index * 5;
  return [[start, end], [0, 1]];
};

const LOADING_ICON_CLASS = "relative inline-block w-full h-full inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]";

export const ThemeToggleButtonIcon = memo(function ThemeToggleButtonIcon({ onClick, progress, isLoading }: Props) {
  // All hooks must be called unconditionally at top level
  const safeProgress = progress ?? new MotionValue(0);
  const svgRotate = useTransform(safeProgress, [0, 100], [40, 80]);
  const moonMaskX = useTransform(safeProgress, [0, 100], [0, 15]);
  const sunCircleScale = useTransform(safeProgress, [0, 100], [1, 0.55]);
  const sunCircleRotate = useTransform(safeProgress, [0, 100], [0, 90]);

  // Sun ray scales - always call all 6 hooks unconditionally
  const sunRayScale0 = useTransform(safeProgress, ...getRayTransformParams(0));
  const sunRayScale1 = useTransform(safeProgress, ...getRayTransformParams(1));
  const sunRayScale2 = useTransform(safeProgress, ...getRayTransformParams(2));
  const sunRayScale3 = useTransform(safeProgress, ...getRayTransformParams(3));
  const sunRayScale4 = useTransform(safeProgress, ...getRayTransformParams(4));
  const sunRayScale5 = useTransform(safeProgress, ...getRayTransformParams(5));

  const sunRayScales = [sunRayScale0, sunRayScale1, sunRayScale2, sunRayScale3, sunRayScale4, sunRayScale5];

  return (
    <button
      onClick={onClick}
      className="relative h-8 w-8 cursor-pointer flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isLoading ? (
        <span className={LOADING_ICON_CLASS} />
      ) : (
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
                cx={9 + 8 * Math.cos((i * 60 * Math.PI) / 180)}
                cy={9 + 8 * Math.sin((i * 60 * Math.PI) / 180)}
                r="1.5"
                className="fill-current"
                style={{ scale }}
              />
            ))}
          </g>
        </motion.svg>
      )}
    </button>
  );
});

ThemeToggleButtonIcon.displayName = 'ThemeToggleButtonIcon';