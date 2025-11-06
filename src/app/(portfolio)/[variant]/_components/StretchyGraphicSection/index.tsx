"use client";

import { useRef, useState, useEffect } from 'react';
import { useScroll } from 'motion/react';
import type { CSSProperties } from 'react';

import { Section, type SectionProps } from '@/components/ui/Section';
import { PerpetualText } from './PerpetualText';
import { GrowthText } from './GrowthText';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type StretchyGraphicSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

// Define the type for our dynamic radius range
type RadiusRange = [string, string];

export const StretchyGraphicSection = ({ variant, ...props }: StretchyGraphicSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // 1. State to hold the dynamically calculated radius range
  const [dynamicRadiusRange, setDynamicRadiusRange] = useState<RadiusRange | undefined>();

  // 2. useEffect to calculate and update the radius on mount and resize
  useEffect(() => {
    const container = containerRef.current;

    // If we're on mobile, we don't need a dynamic radius, so we set it to undefined.
    if (isMobile || !container) {
      setDynamicRadiusRange(undefined);
      return;
    }

    // This function calculates the 'rem' values based on the container's width
    const calculateRadius = (width: number) => {
      // Get the root font size (usually 16px) to convert pixels to rem
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (!rootFontSize) return; // Guard against missing root font size

      // Calculate the 'rem' value for the vertical radius (100% of container width)
      const radiusRem = width / rootFontSize;
      setDynamicRadiusRange([`${radiusRem}rem ${radiusRem}rem 0 0`, '8rem 8rem 0 0']);
    };

    // 3. Use ResizeObserver for performance. It only fires when the element's size changes.
    const observer = new ResizeObserver(entries => {
      // We are only observing one element
      if (entries[0]) {
        calculateRadius(entries[0].contentRect.width);
      }
    });

    observer.observe(container);

    // 4. Cleanup function to disconnect the observer when the component unmounts
    return () => observer.disconnect();

  }, [isMobile]); // Re-run this effect if the screen size crosses the mobile breakpoint

  const number = 0.1;
  const contentAnimationRange = isMobile
    ? [...(["0.5 1", "1 1"] as const)]
    : [...([`${3.45 * number} 1`, `${1 - number} 1`] as const)];
  
  const { scrollYProgress: contentProgress } = useScroll({
    target: containerRef,
    offset: contentAnimationRange,
  });

  return (
    <Section 
      {...props}
      ref={containerRef}
      fillScreen={false}
      // 5. Use the state variable here. It will be undefined on mobile, which is the desired behavior.
      radiusRange={dynamicRadiusRange}
      animationRange={isMobile ? ["0.5 1", "1 1"] : ["0 1", "0.5 1"]}
      ease={[0, 1, 1, 1]}
    >
      <div
        style={{ '--gap': 'calc(0.75em / 4)' } as CSSProperties}
        className={"container-size p-[0.5em] md:p-[0.75em] gap-[var(--gap)] grid grid-cols-1 grid-rows-2 w-full h-[60vw] max-h-screen font-figtree font-black uppercase leading-[0.7125em] text-[clamp(4rem,15vw,12rem)] text-black dark:text-white"}
      >
          <PerpetualText scrollYProgress={contentProgress} />
          <GrowthText
            scrollYProgress={contentProgress}
            variant={variant}
          />
      </div>
    </Section>
  );
};