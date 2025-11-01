"use client";

import React, { ElementType } from 'react';

type WavyTextProps = {
  children: string;
  className?: string;
  as?: ElementType;
};

export const WavyText = ({ children, as = 'p', className = '' }: WavyTextProps) => {
  const Component = as;
  const letters = children.split('');

  return (
    <Component className={`wavy-text-container ${className}`}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className="wavy-letter"
          // This CSS custom property is the key to staggering the animation
          style={{ '--index': index } as React.CSSProperties}
        >
          {/* Use a non-breaking space for actual spaces to prevent collapsing */}
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </Component>
  );
};

/*
    <div className='absolute top-1/2 left-1/2 -translate-1/2'>
        <WavyText as="span" className="block">Let's build something</WavyText>
    </div>
*/