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

        return (
          <div 
            key={`${char}-stack`} 
            // FIX: Apply clip-path and cursor here, on the element listening for the mouse.
            // This ensures the hit-area is physically clipped, not just visually.
            className={clsx(
              "h-full relative -mt-4 cursor-pointer", 
              {
                "[clip-path:inset(0_0_15%_0)]": char !== '_'
              }
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CharacterStack
              SvgComponent={SvgComponent}
              // We no longer need to pass the clip-path down, just ensure it fills the parent
              className={clsx("size-full", {
                "[clip-path:inset(15%_0_0_0)]": char === '_'
              })}
              animateY={isHovering ? `-${100 - 15}%` : "0%"}
              delay={delay}
            />
          </div>
        );
      })}
    </div>
  );
};