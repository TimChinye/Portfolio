// index.tsx

'use client';

import { usePathname } from 'next/navigation';
import { useTransform } from 'motion/react';
import { useTheme } from 'next-themes';

import { useElementBounds } from '@/hooks/useElementBounts';
import { useMousePosition } from '@/hooks/useMousePosition';

import { Section, type SectionProps } from '@/components/ui/Section';
import { CustomLink as Link } from '@/components/ui/CustomLink';
import { BackgroundText } from './BackgroundText';
import { PointingArrow } from './PointingArrow';
import { Marquee } from './Marquee';

type ContactSectionProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'section'>;

export const ContactSection = ({ variant, ...props }: ContactSectionProps) => {
  const pathname = usePathname();
  const isOnContactPage = pathname.includes('/contact');
  // Use `next-themes` to get the current theme.
  // `resolvedTheme` is 'light' or 'dark', even if `theme` is 'system'.
  const { resolvedTheme } = useTheme();

  // 1. These hooks now work correctly, providing stable, document-relative values.
  const mouseY = useMousePosition();
  const [marqueeRef, marqueeBounds] = useElementBounds<HTMLAnchorElement>();

  // 2. This logic is now fed with the correct data and won't change on scroll.
  const transitionDistance = 300;
  let inputRange: number[];
  let outputRange: string[];
  
  const hasMarqueeBounds = marqueeBounds && marqueeBounds.top > 0;
  // Set the color based on the resolved theme from next-themes
  const blackOrWhite = resolvedTheme === 'dark' ? '#FFFFFF' : '#000000';

  if (hasMarqueeBounds) {
    const { top, bottom } = marqueeBounds;
    inputRange = [ top - transitionDistance, top, bottom, bottom + transitionDistance ];
    outputRange = ['#D9D24D', blackOrWhite, blackOrWhite, '#D9D24D'];
  } else {
    // A sensible fallback if bounds aren't measured yet.
    inputRange = [0, 500, 1000]; 
    outputRange = ['#D9D24D', blackOrWhite, '#D9D24D'];
  }
  
  const arrowColor = useTransform(mouseY, inputRange, outputRange);

  return (
    <Section {...props}>
      <div className="h-screen w-full content-center text-center">
        <h1 className="font-newsreader leading-[100%] text-center text-[min(10.25vw,12.985rem)] text-[#7B7B78] dark:text-[#c9c9c6]">
          Let&apos;s build something
          <br />
          <b><i>great</i></b>, together
          <span className="relative inline-block">
            !
            <span className="absolute bottom-[0.25em] left-1/2 -translate-x-1/2 size-[0.15em] rounded-full bg-[#D9D24D] pointer-events-none"></span>
          </span>
        </h1>
      </div>

      {!isOnContactPage && (
        <div className="relative h-[75vh] my-[12.5vh] flex flex-col justify-center">
          <BackgroundText rotation="left" className="-top-75/1000 left-0 text-[min(6.875vw,8.25rem)]">
            Curious about
            <br />
            something?
          </BackgroundText>

          <PointingArrow 
            className='absolute top-16 right-16' 
            color={arrowColor}
          />

          <Link
            ref={marqueeRef}
            href="/contact"
            aria-label="Let's talk, go to contact page"
          >
            <Marquee baseVelocity={100} hoverVelocity={50} className="text-[min(6.7vw,8rem)]">
              LET'S TALK
            </Marquee>
          </Link>
          
          <PointingArrow 
            className='absolute bottom-16 left-16' 
            color={arrowColor}
          />

          <BackgroundText rotation="right" className="-bottom-1/8 right-1/20 italic text-[min(5vw,6rem)]">
            or just say <b>“</b>Hi!<b>”</b>
          </BackgroundText>
        </div>
      )}
    </Section>
  );
};