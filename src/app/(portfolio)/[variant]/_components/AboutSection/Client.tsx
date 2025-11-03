"use client";

import { CSSProperties, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

import { CustomLink as Link } from '@/components/ui/CustomLink';
import type { AboutPageData } from '@/sanity/lib/queries';

import MuxPlayer from '@mux/mux-player-react';

type ClientProps = {
  data: AboutPageData;
};

export function Client({ data }: ClientProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set up the scroll listener on the 200vh container
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"], // Animate from the moment it's at the top to the moment it leaves
  });

  // Animate the clip-path property based on scroll progress.
  // This is the key change to replicate your CSS effect.
  // It animates from a 6rem tall vertical slice in the center to fully revealed.
  const animatedClipPath = useTransform(
    scrollYProgress,
    [0, 1],
    [
      'inset(calc(50% - 3rem) 0% calc(50% - 3rem) 0% round 9999px)',
      'inset(0% 0% 0% 0% round 8rem)'
    ]
  );

  return (
    <div ref={scrollContainerRef} className="relative h-[200vh] w-full">
        <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
            <div className="flex h-full w-full max-w-4xl flex-col items-center justify-center gap-8 px-4 text-center">
            
                <p className="text-xl font-light">
                    {data.topParagraph}
                </p>

                <motion.div
                    style={{ clipPath: animatedClipPath }}
                    className="relative overflow-hidden"
                >
                    <MuxPlayer
                        playbackId={data.playbackId}
                        streamType="on-demand"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 size-full object-cover grayscale"
                    style={{
                    '--controls': 'none'
                    } as CSSProperties}
                    />
                    <Link
                    href="/about"
                    className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/50 bg-black/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                    {data.journeyButtonText}
                    </Link>
                </motion.div>

                <p className="text-xl font-light">
                    {data.bottomParagraph}
                </p>
            </div>
        </div>
    </div>
  );
}