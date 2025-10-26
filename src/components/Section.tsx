// src/components/Section.tsx
"use client";

import { ElementType, ReactNode, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, cubicBezier, type UseScrollOptions, type MotionStyle } from 'motion/react';
import clsx from 'clsx';

type Easing = readonly [number, number, number, number];

export type SectionProps<T extends ElementType = 'section'> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  bgColor?: string;
  darkBgColor?: string;
  textColor?: string;
  darkTextColor?: string;
  wrapperBgColor?: string;
  darkWrapperBgColor?: string;
  animationRange?: UseScrollOptions['offset'];
  yRange?: readonly [string, string];
  scaleRange?: readonly [number, number];
  radiusRange?: readonly [string, string];
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
  wrapperBgColor,
  darkWrapperBgColor,
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

  const y = useTransform(scrollYProgress, [0, 1], yRange ? [...yRange] : ['0rem', '0rem'], { ease: easingFunction });
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange ? [...scaleRange] : [1, 1], { ease: easingFunction });
  const borderRadius = useTransform(scrollYProgress, [0, 1], radiusRange ? [...radiusRange] : ['8rem', '8rem'], { ease: easingFunction });

  const motionStyle: MotionStyle = {};

  if (yRange) motionStyle.y = y;
  if (scaleRange) motionStyle.scale = scale;
  if (radiusRange) {
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
      className={clsx(
        wrapperClassName,
        'mt-[-8rem]',
        wrapperBgColor,
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