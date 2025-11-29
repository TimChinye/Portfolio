"use client";

import clsx from 'clsx';
import { type Transition } from 'motion/react';
import { type SvgProps } from './CharacterSVGs';
import React from 'react';

interface CharacterStackProps {
  SvgComponent: React.FC<SvgProps>;
  className: string;
  animateY?: string;
  delay?: number;
  style?: React.CSSProperties;
};

export const CharacterStack = ({ 
  SvgComponent, 
  className, 
  animateY = "0%", 
  delay = 0,
  style
}: CharacterStackProps) => {

  const transition: Transition = { 
    type: "spring", 
    stiffness: 300, 
    damping: 25, 
    mass: 1,
    delay: delay 
  };

  return (
    // The outer div maintains the clip-path and sizing
    <div style={style} className={clsx("relative h-full", className)}>
      
      {/* Bottom layer SVG - Animated Directly */}
      <SvgComponent 
        className="h-full w-auto fill-black dark:fill-white" 
        animate={{ y: animateY }}
        transition={transition}
      />
      
      {/* Top layer SVG - Animated Directly */}
      <SvgComponent 
        className="h-full w-auto fill-white dark:fill-[#D9D24D] -translate-y-15/100 -mb-px" 
        animate={{ y: animateY }}
        transition={transition}
      />
    </div>
  );
};