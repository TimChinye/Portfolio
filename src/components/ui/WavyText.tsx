"use client";

import clsx from 'clsx';
import React, { ComponentPropsWithoutRef, ElementType, memo, useMemo } from 'react';

type WavyTextProps<T extends ElementType> = {
  as?: T;
  children: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

export const WavyText = memo(function WavyText<T extends ElementType = 'p'>({
  children,
  as,
  className,
  ...props
}: WavyTextProps<T>) {
  const Component = as || 'p';
  const letters = useMemo(() => children.split(''), [children]);

  return (
    <Component {...props} className={clsx('wavy-text-container', props.className)}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className="wavy-letter"
          style={{ '--index': index } as React.CSSProperties}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </Component>
  );
});

WavyText.displayName = 'WavyText';