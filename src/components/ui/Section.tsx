"use client";

import { ElementType, ReactNode, useEffect, useRef, useMemo, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, cubicBezier, type UseScrollOptions, type MotionStyle, type MotionValue } from 'motion/react';
import { useTheme } from "next-themes";
import clsx from 'clsx';

type Easing = readonly [number, number, number, number];

export type SectionProps<T extends ElementType = 'section'> = {
  as?: T;
  children?: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  className?: string;
  bgColor?: string;
  darkBgColor?: string;
  textColor?: string;
  darkTextColor?: string;
  wrapperBgColor?: string;
  darkWrapperBgColor?: string;
  animationRange?: UseScrollOptions['offset'];
  scopeAnimationToContent?: boolean;
  fillScreen?: boolean;
  yRange?: readonly [string, string];
  scaleRange?: readonly [number, number];
  radiusRange?: readonly [string, string];
  ease?: Easing;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children'>;

export function Section<T extends ElementType = 'section'>({
  as,
  children,
  className,
  bgColor = 'bg-[#F5F5EF]',
  darkBgColor = 'bg-[#2F2F2B]',
  wrapperBgColor,
  darkWrapperBgColor,
  textColor = 'text-[#2F2F2B]',
  darkTextColor = 'text-[#F5F5EF]',
  animationRange = ["start end", "start 0.5"],
  scopeAnimationToContent = false,
  fillScreen = true,
  yRange,
  scaleRange,
  radiusRange,
  ease,
  ...props
}: SectionProps<T>) {
  const Component = as || 'section';
  const MotionComponent = motion.create(Component);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const [offsets, setOffsets] = useState([0, 1]);
  
  const { resolvedTheme } = useTheme();
  
  const [isFirstElement, setFirstElement] = useState<boolean>(false);
  const [isLastElement, setLastElement] = useState<boolean>(false);

  const [lightWrapperBg, setLightWrapperBg] = useState(wrapperBgColor);
  const [darkWrapperBg, setDarkWrapperBg] = useState(darkWrapperBgColor);

  useEffect(() => {
    if (wrapperRef.current?.parentElement) {
      const parent = wrapperRef.current.parentElement;
      const children = Array.from(parent.children);
      const currentIndex = children.indexOf(wrapperRef.current);

      const isFirst = currentIndex === 0;
      const isLast = currentIndex === children.length - 1;

      setFirstElement(isFirst);
      setLastElement(isLast);

      if (!isFirst) {
        const prevSibling = children[currentIndex - 1];
        const prevInnerElement = prevSibling?.children[0];

        if (prevInnerElement) {
          const prevBgColor = window.getComputedStyle(prevInnerElement).backgroundColor;
          const tailwindBgClass = `bg-[${prevBgColor}]`;

          if (resolvedTheme === 'dark') {
            setDarkWrapperBg(tailwindBgClass);
          } else {
            setLightWrapperBg(tailwindBgClass);
          }
        }
      }
    }
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    // This effect measures the elements and calculates the precise animation scope
    if (scopeAnimationToContent && wrapperRef.current && contentRef.current) {
      const wrapperHeight = wrapperRef.current.offsetHeight;
      
      // Get padding values from the content element
      const computedStyle = window.getComputedStyle(contentRef.current);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);

      // Calculate the start and end points as a fraction of the total height
      const startOffset = paddingTop / wrapperHeight;
      const endOffset = 1 - (paddingBottom / wrapperHeight);
      
      setOffsets([startOffset, endOffset]);
    }
  }, [scopeAnimationToContent]); // Re-run if the prop changes

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: animationRange,
  });

  // Conditionally remap the progress. If not scoped, contentProgress is the same as scrollYProgress.
  const contentProgress = scopeAnimationToContent
    ? useTransform(scrollYProgress, offsets, [0, 1], { clamp: true })
    : scrollYProgress;

  const easingFunction = useMemo(() => (ease ? cubicBezier(...ease) : undefined), [ease]);

  const y = useTransform(contentProgress, [0, 1], yRange ? [...yRange] : ['0rem', '0rem'], { ease: easingFunction });
  const scale = useTransform(contentProgress, [0, 1], scaleRange ? [...scaleRange] : [1, 1], { ease: easingFunction });
  const borderRadius = useTransform(contentProgress, [0, 1], radiusRange ? [...radiusRange] : ['8rem', '8rem'], { ease: easingFunction });

  const motionStyle: MotionStyle = {};

  if (yRange) motionStyle.y = y;
  if (scaleRange) motionStyle.scale = scale;
  if (radiusRange) {
    motionStyle.borderTopLeftRadius = borderRadius;
    motionStyle.borderTopRightRadius = borderRadius;
  }
  
  const hasAnimation = yRange || scaleRange || radiusRange;
  
  return (
    <div
      ref={wrapperRef}
      className={clsx(
        'relative',
        scaleRange && scaleRange[0] > 1 && 'overflow-x-clip',
        lightWrapperBg,
        darkWrapperBg && `dark:${darkWrapperBg}`,
        isFirstElement ? 'mt-0' : '-mt-32'
      )}
    >
      <MotionComponent
        ref={contentRef}
        style={hasAnimation ? motionStyle : undefined}
        className={clsx(
          'sticky top-0 h-fit box-content',
          fillScreen && 'min-h-screen',
          isLastElement ? 'pt-24 md:pt-32' :
          isFirstElement ? 'pb-24 md:pb-32' :
          'py-24 md:py-32',
          bgColor,
          darkBgColor && `dark:${darkBgColor}`,
          textColor,
          darkTextColor && `dark:${darkTextColor}`,
          !isFirstElement && !radiusRange && 'rounded-t-[8rem]',
          isFirstElement && 'rounded-none',
          className
        )}
        {...props}
      >
        {typeof children === 'function' ? children(contentProgress) : children}
      </MotionComponent>
    </div>
  );
}