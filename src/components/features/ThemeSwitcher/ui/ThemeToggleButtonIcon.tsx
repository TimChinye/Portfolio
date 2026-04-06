// src/components/features/ThemeSwitcher/ui/ThemeToggleButtonIcon.tsx
"use client";

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

export function ThemeToggleButtonIcon({ onClick, progress, isLoading }: Props) {
  // Static mappings: 0 = Moon, 100 = Sun
  const svgRotate = progress ? useTransform(progress, [0, 100], [40, 80]) : undefined;
  const moonMaskX = progress ? useTransform(progress, [0, 100], [0, 15]) : undefined;
  const sunCircleScale = progress ? useTransform(progress, [0, 100], [1, 0.55]) : undefined;
  const sunCircleRotate = progress ? useTransform(progress, [0, 100], [0, 90]) : undefined;

  const sunRayScales = progress ? [
    useTransform(progress, ...getRayTransformParams(0)),
    useTransform(progress, ...getRayTransformParams(1)),
    useTransform(progress, ...getRayTransformParams(2)),
    useTransform(progress, ...getRayTransformParams(3)),
    useTransform(progress, ...getRayTransformParams(4)),
    useTransform(progress, ...getRayTransformParams(5)),
  ] : [];

  return (
    <button
      onClick={onClick}
      className="relative h-8 w-8 cursor-pointer flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isLoading ? (
        <span className="relative inline-block w-full h-full inset-[2px_-2px] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black dark:before:bg-white after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-black dark:after:bg-white before:animate-[animloader_1s_linear_infinite] after:animate-[animloader_1s_linear_infinite] after:animate-delay-[0.25s]"></span>
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
}