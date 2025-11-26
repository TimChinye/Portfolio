'use client';

import { usePathname } from 'next/navigation';
import { useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

import { useMousePosition } from '@/hooks/useMousePosition';
import { useWindowScrollY } from '@/hooks/useWindowScrollY';

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

  const { resolvedTheme } = useTheme();
  const { clientY } = useMousePosition();
  const scrollY = useWindowScrollY();

  const marqueeRef = useRef<HTMLAnchorElement>(null);
  const [marqueeBounds, setMarqueeBounds] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    const updateBounds = () => {
      if (!marqueeRef.current) return;
      const rect = marqueeRef.current.getBoundingClientRect();
      const currentScroll = window.scrollY;
      
      setMarqueeBounds({
        top: rect.top + currentScroll,
        bottom: rect.bottom + currentScroll,
      });
    };

    updateBounds();

    window.addEventListener('resize', updateBounds);

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('resize', updateBounds);
      resizeObserver.disconnect();
    };
  }, []);

  const transitionDistance = 300;
  let inputRange: number[];
  let outputRange: string[];
  
  const hasMarqueeBounds = marqueeBounds && marqueeBounds.top > 0;
  const blackOrWhite = resolvedTheme === 'dark' ? '#FFFFFF' : '#000000';

  if (hasMarqueeBounds) {
    const marqueeTopInDocument = marqueeBounds.top;
    const marqueeBottomInDocument = marqueeBounds.bottom;

    inputRange = [
      marqueeTopInDocument - transitionDistance,
      marqueeTopInDocument,
      marqueeBottomInDocument,
      marqueeBottomInDocument + transitionDistance
    ];
    
    outputRange = ['#D9D24D', blackOrWhite, blackOrWhite, '#D9D24D'];
  } else {
    inputRange = [0, 500, 1000]; 
    outputRange = ['#D9D24D', blackOrWhite, '#D9D24D'];
  }

  const viewportMouseY = useTransform(() => scrollY.get() + clientY.get());
  let arrowColour = useTransform(viewportMouseY, inputRange, outputRange);

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
            color={arrowColour}
            initRotation={180}
          />

          <Link
            ref={marqueeRef}
            href="/contact"
            aria-label="Let's talk, go to contact page"
          >
            <Marquee baseVelocity={100} hoverVelocity={50} className="text-[min(12.5vw,8rem)] md:text-[min(6.7vw,8rem)]">
              LET'S TALK
            </Marquee>
          </Link>
          
          <PointingArrow 
            className='absolute bottom-16 left-16'
            color={arrowColour}
            initRotation={0}
          />

          <BackgroundText rotation="right" className="-bottom-1/8 right-1/20 italic text-[min(5vw,6rem)]">
            or just say <b>“</b>Hi!<b>”</b>
          </BackgroundText>
        </div>
      )}
    </Section>
  );
};