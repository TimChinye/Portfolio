"use client";

import { ElementType, ReactNode, useEffect, useRef, useMemo, useState, useLayoutEffect, forwardRef, ForwardedRef, createContext, useContext } from 'react';
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

// Helper function to parse color values from Tailwind class strings
const parseColorClasses = (classes: string) => {
  // Regex to find the color inside bg-[...] and dark:bg-[...]
  const lightMatch = classes.match(/bg-\[([^\]]+)\]/);
  const darkMatch = classes.match(/dark:bg-\[([^\]]+)\]/);

  // Use the found color, or fallback to the light color if no dark variant is specified
  const lightColor = lightMatch ? lightMatch[1] : '';
  const darkColor = darkMatch ? darkMatch[1] : lightColor;
  
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
  scopeAnimationToContent?: boolean;
  fillScreen?: boolean;
  stickyDuration?: string;
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
  scopeAnimationToContent = false,
  fillScreen = true,
  stickyDuration,
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

  const [offsets, setOffsets] = useState([0, 1]);
  
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

  useLayoutEffect(() => {
    // This effect measures the elements and calculates the precise animation scope
    if (scopeAnimationToContent && wrapperRef && 'current' in wrapperRef && wrapperRef.current && contentRef.current) {
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
  }, [scopeAnimationToContent, wrapperRef]); // Re-run if the prop changes

  const { scrollYProgress: entryProgress } = useScroll({
    target: wrapperRef,
    offset: animationRange,
  });

  const { scrollYProgress: stickyProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Conditionally remap the progress. If not scoped, contentProgress is the same as scrollYProgress.
  const contentProgress = scopeAnimationToContent
    ? useTransform(entryProgress, offsets, [0, 1], { clamp: true })
    : entryProgress;

  const progressForChildren = stickyDuration ? stickyProgress : contentProgress;

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
  const y = useTransform(contentProgress, [0, 1], resolvedYRange ? [...resolvedYRange] : ['0rem', '0rem'], { ease: yEase });
  const scale = useTransform(contentProgress, [0, 1], resolvedScaleRange ? [...resolvedScaleRange] : [1, 1], { ease: scaleEase });
  const borderRadius = useTransform(contentProgress, [0, 1], resolvedRadiusRange ? [...resolvedRadiusRange] : ['8rem 8rem 0 0', '8rem 8rem 0 0'], { ease: radiusEase });

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
        isFirstElement ? 'mt-0' : '-mt-32',
        isFirstElement && 'z-0'
      )}
    >
      <MotionComponent
        ref={contentRef}
        data-bg-light={bgColors.light}
        data-bg-dark={bgColors.dark}
        style={hasAnimation ? motionStyle : undefined}
        className={clsx(
          'sticky top-0 h-fit box-content',
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