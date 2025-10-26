// src/components/Section.tsx
"use client";

import { ElementType, ReactNode, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, cubicBezier, type UseScrollOptions } from 'motion/react';
import clsx from 'clsx';

// Type for cubic-bezier easing values: [x1, y1, x2, y2]
type Easing = [number, number, number, number];

export type SectionProps<T extends ElementType = 'section'> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  bgColor?: string;
  darkBgColor?: string;
  textColor?: string;
  darkTextColor?: string;
  // --- NEW PROPS ---
  wrapperBgColor?: string;
  darkWrapperBgColor?: string;
  // ---
  animationRange?: UseScrollOptions['offset'];
  yRange?: [string, string];
  scaleRange?: [number, number];
  radiusRange?: [string, string];
  ease?: Easing;

} & Omit<React.ComponentPropsWithoutRef<T>, 'children'>;

export function Section<T extends ElementType = 'section'>({
  as,
  children,
  className,
  bgColor = 'bg-white',
  darkBgColor = 'bg-black',
  textColor = 'text-black',
  darkTextColor = 'text-white',
  // --- DESTRUCTURE NEW PROPS ---
  wrapperBgColor,
  darkWrapperBgColor,
  // ---
  animationRange = ["start end", "start 0.5"],
  yRange,
  scaleRange,
  radiusRange,
  ease,
  ...props
}: SectionProps<T>) {
  const Component = as || 'section';
  const MotionComponent = motion.create(Component);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: animationRange,
  });

  const easingFunction = useMemo(() => (ease ? cubicBezier(...ease) : undefined), [ease]);

  const motionStyle: any = {};
  
  if (yRange) motionStyle.y = useTransform(scrollYProgress, [0, 1], yRange, { ease: easingFunction });
  if (scaleRange) motionStyle.scale = useTransform(scrollYProgress, [0, 1], scaleRange, { ease: easingFunction });
  if (radiusRange) {
    const borderRadius = useTransform(scrollYProgress, [0, 1], radiusRange, { ease: easingFunction });
    motionStyle.borderTopLeftRadius = borderRadius;
    motionStyle.borderTopRightRadius = borderRadius;
  }
  
  const hasAnimation = yRange || scaleRange || radiusRange;

  const wrapperClassName = clsx('relative', {
      'overflow-x-clip': scaleRange && scaleRange[0] > 1
  });
  
  const computedClassName = clsx(
    'py-32 py-32 sticky top-0 h-screen w-full',
    bgColor,
    darkBgColor && `dark:${darkBgColor}`,
    textColor,
    darkTextColor && `dark:${darkTextColor}`,
    !radiusRange && 'rounded-t-[8rem]',
    className
  );

  return (
    <div
      ref={ref}
      // --- CORRECT IMPLEMENTATION: Use the new props for the wrapper ---
      className={clsx(
        wrapperClassName,
        'mt-[-8rem]',
        wrapperBgColor, // Use the passed-in wrapper color
        darkWrapperBgColor && `dark:${darkWrapperBgColor}`
      )}
    >
      <MotionComponent
        style={hasAnimation ? motionStyle : undefined}
        className={computedClassName}
        {...props}
      >
        {children}
      </MotionComponent>
    </div>
  );
}