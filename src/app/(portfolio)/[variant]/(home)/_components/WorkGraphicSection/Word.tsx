// src/app/(portfolio)/[variant]/(home)/_components/WorkGraphicSection/Word.tsx

"use client";

import { useState } from 'react';
import clsx from 'clsx';
import { SVG_MAP, type CharacterKey, type SvgProps } from './CharacterSVGs';
import { CharacterStack } from './CharacterStack';

const CHARACTERS: CharacterKey[] = ["W", "O", "R", "K", "_"];

interface WordProps {
  isClipped: boolean;
}

export const Word = ({ isClipped }: WordProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div 
      className="flex h-[1em] w-fit items-center justify-center [&>*:not(:first-child)]:pl-[0.05em]"
    >
      {CHARACTERS.map((char, index) => {
        const SvgComponent: React.FC<SvgProps> = SVG_MAP[char];

        // 1. Static/Background Layers (Clipped)
        if (isClipped) {
          return (
            <SvgComponent
              key={`${char}-clipped`}
              className="h-full w-auto fill-[black] dark:fill-white"
            />
          );
        }

        // 2. Interactive Top Layer
        const isHovering = hoveredIndex !== null;
        // Calculate distance from the hovered element (0 if self, 1 if neighbor, etc.)
        const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - index) : 0;
        // Stagger delay based on distance (0.05s per step)
        const delay = isHovering ? distance * 0.125 : 0;

        const OFFSET_PERC = 15.15;

        return (
          <div 
            key={`${char}-stack`} 
            // FIX: Apply clip-path and cursor here, on the element listening for the mouse.
            // This ensures the hit-area is physically clipped, not just visually.
            className="h-full relative cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CharacterStack
              SvgComponent={SvgComponent}
              // We no longer need to pass the clip-path down, just ensure it fills the parent
              className="size-full"
              style={{ clipPath: char === '_' ? `inset(${OFFSET_PERC}% 0 0 0)` : `inset(0 0 ${OFFSET_PERC}% 0)` }}
              animateY={isHovering ? `-${100 - OFFSET_PERC}%` : "0%"}
              delay={delay}
            />
          </div>
        );
      })}
    </div>
  );
};