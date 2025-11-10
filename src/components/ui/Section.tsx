"use client";

import { ElementType, ReactNode, useEffect, useRef, useMemo, useState, useLayoutEffect, forwardRef, ForwardedRef, createContext, useContext, RefObject } from 'react';
import { motion, useScroll, useTransform, cubicBezier, type UseScrollOptions, type MotionStyle, type MotionValue } from 'motion/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from "next-themes";
import clsx from 'clsx';

const SectionContext = createContext<MotionValue<number> | null>(null);

export function useSectionScrollProgress() {
  const context = useContext(SectionContext);
  if (context === null) {
    throw new Error('useSectionScrollProgress must be used within a <Section> component');
  }
  return context;
}

export function useElementOffsets(elementRef: RefObject<HTMLElement | null>, onParent?: boolean) {
  const [offsets, setOffsets] = useState<[number, number]>([0, 1]);

  useLayoutEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      const containerElement = onParent ? element.parentElement : element;

      if (containerElement) {
        const containerHeight = containerElement.offsetHeight;
        const computedStyle = window.getComputedStyle(element);
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);

        const startOffset = paddingTop / containerHeight;
        const endOffset = 1 - (paddingBottom / containerHeight);

        setOffsets([startOffset, endOffset]);
      }
    }
  }, [elementRef]);

  return offsets;
}

// Helper function to parse color values from Tailwind class strings
export const parseColorClasses = (classes: string) => {
  // Regex to find the color inside bg-[...] and dark:bg-[...]
  const lightMatch = classes.match(/bg-\[([^\]]+)\]/)?.[1];
  const darkMatch = classes.match(/dark:bg-\[([^\]]+)\]/)?.[1];

  // Use the found color, or fallback to the light color if no dark variant is specified
  const lightColor = lightMatch || '';
  const darkColor = darkMatch || lightColor;
  
  return { light: lightColor, dark: darkColor };
};


type Easing = readonly [number, number, number, number];

type EasingObject = {
  y?: Easing;
  scale?: Easing;
  radius?: Easing;
};

type ResponsiveRangeObject<T> = {
  mobile: T;
  desktop: T;
};

type ResponsiveRange<T> = T | ResponsiveRangeObject<T>;

export type SectionProps<T extends ElementType = 'section'> = {
  as?: T;
  children?: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  className?: string;
  noWrapperBg?: boolean;
  bgClasses?: string;
  textClasses?: string;
  animationRange?: UseScrollOptions['offset'];
  fillScreen?: boolean;
  stickyDuration?: string;
  stickyAnimationRange?: UseScrollOptions['offset'];
  yRange?: ResponsiveRange<readonly [string, string]>;
  scaleRange?: ResponsiveRange<readonly [number, number]>;
  radiusRange?: ResponsiveRange<readonly [string, string]>;
  ease?: Easing | EasingObject;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children'>;

const SectionComponent = forwardRef(function Section<T extends ElementType = 'section'>(
  {
  as,
  children,
  className,
  noWrapperBg = false,
  bgClasses = 'bg-[#F5F5EF] dark:bg-[#2F2F2B]',
  textClasses = 'text-[#2F2F2B] dark:text-[#F5F5EF]',
  animationRange = ["start end", "start 0.5"],
  fillScreen = true,
  stickyDuration,
  stickyAnimationRange = ["start start", "end end"],
  yRange,
  scaleRange,
  radiusRange,
  ease,
  ...props
  }: SectionProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const Component = as || 'section';
  const MotionComponent = motion.create(Component);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const resolveResponsiveProp = <T,>(prop: ResponsiveRange<T> | undefined): T | undefined => {
    if (prop && typeof prop === 'object' && !Array.isArray(prop)) {
      return isMobile ? (prop as ResponsiveRangeObject<T>).mobile : (prop as ResponsiveRangeObject<T>).desktop;
    }
    return prop as T | undefined;
  };
  
  const resolvedYRange = resolveResponsiveProp(yRange);
  const resolvedScaleRange = resolveResponsiveProp(scaleRange);
  const resolvedRadiusRange = resolveResponsiveProp(radiusRange);

  useLayoutEffect(() => {
    if (!ref) return;

    if (typeof ref === 'function') ref(wrapperRef.current);
    else ref.current = wrapperRef.current;
  }, [ref]);
  
  const [isFirstElement, setFirstElement] = useState<boolean>(false);
  const [isLastElement, setLastElement] = useState<boolean>(false);
  
  const { resolvedTheme } = useTheme();

  const bgColors = useMemo(() => parseColorClasses(bgClasses), [bgClasses]);

  useEffect(() => {
    if (wrapperRef && 'current' in wrapperRef && wrapperRef.current?.parentElement) {
      const parent = wrapperRef.current.parentElement;
      const children = Array.from(parent.children);
      const currentIndex = children.indexOf(wrapperRef.current);

      const isFirst = currentIndex === 0;
      const isLast = currentIndex === children.length - 1;

      setFirstElement(isFirst);
      setLastElement(isLast);

      if (!isFirst && !noWrapperBg) {
        const prevSibling = children[currentIndex - 1];
        const prevInnerElement = prevSibling?.children[0] as HTMLElement;

        if (prevInnerElement && wrapperRef.current) {
          const colorToSet = resolvedTheme === 'dark'
            ? prevInnerElement.dataset.bgDark
            : prevInnerElement.dataset.bgLight;
          
          if (colorToSet) wrapperRef.current.style.backgroundColor = colorToSet;
        }
      }
    }
  }, [resolvedTheme, wrapperRef, noWrapperBg]);

  const { scrollYProgress: entryProgress } = useScroll({
    target: wrapperRef,
    offset: animationRange,
  });

  const { scrollYProgress: stickyProgress } = useScroll({
    target: wrapperRef,
    offset: stickyAnimationRange,
  });

  const progressForChildren = stickyDuration ? stickyProgress : entryProgress;

  // Create separate easing functions for each property
  const getEasingFunction = (property: keyof EasingObject) => {
    if (!ease) return undefined; // No easing provided

    // If 'ease' is an array, use it. Otherwise, look for the specific property in the object.
    const specificEase = (Array.isArray(ease) ? ease : (ease as EasingObject)[property]) as Easing;

    // Return the cubic-bezier function if an ease is found
    return specificEase ? cubicBezier(...specificEase) : undefined;
  };

  const yEase = useMemo(() => getEasingFunction('y'), [ease]);
  const scaleEase = useMemo(() => getEasingFunction('scale'), [ease]);
  const radiusEase = useMemo(() => getEasingFunction('radius'), [ease]);

  // Updated: Use the specific easing function for each transform
  const y = useTransform(entryProgress, [0, 1], resolvedYRange ? [...resolvedYRange] : ['0rem', '0rem'], { ease: yEase });
  const scale = useTransform(entryProgress, [0, 1], resolvedScaleRange ? [...resolvedScaleRange] : [1, 1], { ease: scaleEase });
  const borderRadius = useTransform(entryProgress, [0, 1], resolvedRadiusRange ? [...resolvedRadiusRange] : ['8rem 8rem 0 0', '8rem 8rem 0 0'], { ease: radiusEase });

  const motionStyle: MotionStyle = {};

  if (resolvedYRange) motionStyle.y = y;
  if (resolvedScaleRange) motionStyle.scaleX = scale;
  if (resolvedRadiusRange) motionStyle.borderRadius = borderRadius;
  const hasAnimation = resolvedYRange || resolvedScaleRange || resolvedRadiusRange;
  
  return (
    <div
      ref={wrapperRef}
      style={stickyDuration ? { height: stickyDuration } : {}}
      className={clsx(
        'relative',
        resolvedScaleRange && resolvedScaleRange[0] > 1 && 'overflow-x-clip',
        isFirstElement ? 'mt-0' : '-mt-24 md:-mt-32',
        isFirstElement && 'z-0'
      )}
    >
      <MotionComponent
        ref={contentRef}
        data-bg-light={bgColors.light}
        data-bg-dark={bgColors.dark}
        style={hasAnimation ? motionStyle : undefined}
        className={clsx(
          'sticky top-0 box-content overflow-hidden',
          !className?.match(/\b(([\w-]+):)?(h)-(\d+(\.\d+)?|px|full|screen|fit|auto|\[[^\]]+\])\b/)?.[0] && 'h-fit',
          fillScreen && 'min-h-screen',
          isLastElement ? 'pt-24 md:pt-32' :
          isFirstElement ? 'pb-24 md:pb-32' :
          !className?.match(/(([\w-]+):)?(p[tblrxyse]?)-(\d+|\[[^\]]+\])/)?.[0] && 'py-24 md:py-32',
          bgClasses,
          textClasses,
          !isFirstElement && !resolvedRadiusRange && 'rounded-t-[6rem] md:rounded-t-[8rem]',
          isFirstElement && 'rounded-none',
          className
        )}
        {...props}
      >
        <SectionContext.Provider value={progressForChildren}>
          {typeof children === 'function' ? children(progressForChildren) : children}
        </SectionContext.Provider>
      </MotionComponent>
    </div>
  );
});

SectionComponent.displayName = 'Section';
export const Section = SectionComponent as <T extends ElementType = 'section'>(props: SectionProps<T> & { ref?: ForwardedRef<HTMLDivElement> }) => React.ReactElement;