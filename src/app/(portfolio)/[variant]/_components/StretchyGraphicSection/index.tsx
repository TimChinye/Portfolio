// StretchyGraphicSection.tsx

"use client";

import { Section, type SectionProps } from '@/components/ui/Section';

import { PerpetualText } from './PerpetualText';
import { GrowthText } from './GrowthText';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import type { CSSProperties } from 'react';

type StretchyGraphicSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const StretchyGraphicSection = ({ variant, ...props }: StretchyGraphicSectionProps) => {
  const gap = "gap-[calc(0.75em/4)]";

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Section
      {...props}
      animationRange={isMobile ? ["0.5 1", "1 1"] : ["0.2 1", "0.9 1"]}
      radiusRange={isMobile ? undefined : ['25vw', '4rem']}
      {...{}}
      fillScreen={false}
    >
      {(contentProgress) => (
        <div
          style={{ '--gap': 'calc(0.75em / 4)' } as CSSProperties}
          className={"container-size p-[0.5em] md:p-[0.75em] gap-[var(--gap)] grid grid-cols-1 grid-rows-2 w-full h-[55.5vw] font-figtree font-black uppercase leading-[0.7125em] text-[clamp(4rem,15vw,12rem)] text-black dark:text-white"}
        >
            <PerpetualText scrollYProgress={contentProgress} />
            <GrowthText
              scrollYProgress={contentProgress}
              variant={variant}
              className={gap}
            />
        </div>
      )}
    </Section>
  );
};