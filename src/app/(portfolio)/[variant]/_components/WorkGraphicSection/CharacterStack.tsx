// src/components/CharacterStack.tsx
import { SVG_MAP, type SvgProps } from './CharacterSVGs';
import React from 'react';

// Define the props for this component using a TypeScript interface
interface CharacterStackProps {
  SvgComponent: React.FC<SvgProps>;
}

/**
 * Renders a duplicated two-SVG stack for a single character.
 * The SVGs are layered on top of each other using absolute positioning.
 */
export const CharacterStack = ({ SvgComponent }: CharacterStackProps) => {

  return (
    // The parent div is a relative container for the absolute children.
    // h-full: Corresponds to `height: 100%` from the original CSS.
    // The component itself will be sized by its parent in Word.tsx
    <div className="relative h-full">
      {/* Bottom layer SVG: This is the "white" one. */}
      <SvgComponent className="h-full w-auto fill-black dark:fill-white" />
      
      {/* Top layer SVG: This is the "black" one, which matches the current theme color. */}
      <SvgComponent className="h-full w-auto fill-white dark:fill-black" />
    </div>
  );
};