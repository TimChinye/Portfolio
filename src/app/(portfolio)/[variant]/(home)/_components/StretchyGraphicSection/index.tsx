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

type RadiusRange = [string, string];

export const StretchyGraphicSection = ({ variant, ...props }: StretchyGraphicSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [dynamicRadiusRange, setDynamicRadiusRange] = useState<RadiusRange | undefined>();

  useEffect(() => {
    const container = containerRef.current;

    if (isMobile || !container) {
      setDynamicRadiusRange(undefined);
      return;
    }

    const calculateRadius = (width: number) => {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (!rootFontSize) return;

      const radiusRem = width / rootFontSize;
      setDynamicRadiusRange([`${radiusRem}rem ${radiusRem}rem 0 0`, '8rem 8rem 0 0']);
    };

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        calculateRadius(entries[0].contentRect.width);
      }
    });

    observer.observe(container);

    return () => observer.disconnect();

  }, [isMobile]);

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
      radiusRange={dynamicRadiusRange}
      ease={[0, 1, 1, 1]}
    >
      <div
        style={{ '--gap': 'calc(0.75em / 4)' } as CSSProperties}
        className={"container-size p-[0.5em] md:p-[0.75em] gap-(--gap) grid grid-cols-1 grid-rows-2 w-full h-[60vw] max-h-screen font-figtree font-black uppercase leading-[0.7125em] text-black dark:text-white"}
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