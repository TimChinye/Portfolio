"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { useScroll } from 'motion/react';
import { useTheme } from 'next-themes'; // Import useTheme
import { PaintCanvas } from './_components/PaintCanvas';
import { ScrollPill } from './_components/ScrollPill';
import { CursorDot } from './_components/CursorDot';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import clsx from 'clsx';

export function Client() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme(); // Get current theme

  useEffect(() => { setMounted(true); }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["0 0", "1 0"]
  });

  const windowWidth = useWindowWidth();

  const BRUSH_SIZE = useMemo(() => {
    if (windowWidth === 0) return 64; 
    return Math.max(16, Math.min(64, windowWidth * 0.05));
  }, [windowWidth]);

  const PAINT_COLOR = '#D9D24D';

  const textClasses = clsx(
    "font-figtree font-black leading-[0.875] tracking-wide uppercase",
    "inline-block absolute top-1/2 left-1/2 -translate-1/2 z-1",
    "text-[min(24cqw,32cqh)]",
    "select-none pointer-events-none"
  );

  const TextContent = () => (
    <>
      Ready
      <br />
      To
      <br />
      Talk?
    </>
  );

  // Force the blend mode via JS to ensure it updates instantly and correctly
  const blendMode = mounted && resolvedTheme === 'dark' ? 'darken' : 'lighten';

  return (
    <div
      ref={containerRef} 
      className="h-screen min-h-[600px] bg-[#F5F5EF] dark:bg-[#1A1A17] container-size"
    >
      <CursorDot size={BRUSH_SIZE} color={PAINT_COLOR} scrollProgress={scrollYProgress} />
      <ScrollPill scrollProgress={scrollYProgress} />

      <div className="relative size-full text-center content-center">
        
        {/* LAYER A: THE MASK (Text color flips based on theme) */}
        <h1 className={clsx(textClasses, "text-[#2F2F2B] dark:text-[#F5F5EF]")}>
          <TextContent />
        </h1>

        {/* LAYER B: THE PAINT */}
        <div 
            className="absolute inset-0 z-1 pointer-events-none"
            style={{ mixBlendMode: blendMode as any }} // Explicit style
        >
             <PaintCanvas brushSize={BRUSH_SIZE} color={PAINT_COLOR} />
        </div>

        {/* LAYER C: THE STROKE */}
        <h1 
          className={clsx(textClasses, "text-transparent")}
          style={{
            WebkitTextStroke: '0.0125em',
            WebkitTextStrokeColor: mounted && resolvedTheme === 'dark' ? '#F5F5EF' : '#2F2F2B'
          }}
        >
          <TextContent />
        </h1>
      </div>
    </div>
  );
}