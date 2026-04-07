"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { useScroll, useMotionValue } from 'motion/react';
import { useTheme } from 'next-themes';
import { PaintCanvas } from './_components/PaintCanvas';
import { ScrollPill } from './_components/ScrollPill';
import { CursorDot } from './_components/CursorDot';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import clsx from 'clsx';

export function Client() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Shared cursor position - PaintCanvas updates this during drawing
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  // Flag to indicate touch is in PaintCanvas text (prevents ScrollPill/CursorDot from resetting)
  const isInPaintCanvas = useRef(false);

  useEffect(() => { 
    setMounted(true);
    // Initialize to center
    if (typeof window !== 'undefined') {
      cursorX.set(window.innerWidth / 2);
      cursorY.set(window.innerHeight / 2);
    }
  }, [cursorX, cursorY]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["0 0", "1 0"]
  });

  const windowWidth = useWindowWidth();

  const BRUSH_SIZE = useMemo(() => {
    if (!mounted || windowWidth === 0) return 32; 
    return Math.max(16, Math.min(64, windowWidth * 0.05));
  }, [windowWidth, mounted]);

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

  const blendMode = mounted && resolvedTheme === 'dark' ? 'darken' : 'lighten';

  // Callback for PaintCanvas to update cursor position during drawing
  const handleTouchPosition = (x: number, y: number, inText: boolean) => {
    isInPaintCanvas.current = inText;
    if (inText) {
      cursorX.set(x);
      cursorY.set(y);
    }
  };

  return (
    <div
      ref={containerRef} 
      className="h-dvh min-h-[600px] bg-[#F5F5EF] dark:bg-[#1A1A17] container-size"
    >
      <CursorDot size={BRUSH_SIZE} color={PAINT_COLOR} scrollProgress={scrollYProgress} externalX={cursorX} externalY={cursorY} isInPaintCanvasRef={isInPaintCanvas} />
      <ScrollPill scrollProgress={scrollYProgress} externalX={cursorX} externalY={cursorY} isInPaintCanvasRef={isInPaintCanvas} />

      <div className="relative size-full text-center content-center">
        
        {/* LAYER A: THE MASK */}
        <h1 className={clsx(textClasses, "text-[#2F2F2B] dark:text-[#F5F5EF]")}>
          <TextContent />
        </h1>

        {/* LAYER B: THE PAINT */}
        <div 
            className="absolute inset-0 z-1"
            style={{ mixBlendMode: blendMode as any }}
        >
             <PaintCanvas brushSize={BRUSH_SIZE} color={PAINT_COLOR} textRef={textRef} onTouchPosition={handleTouchPosition} />
        </div>

        {/* LAYER C: THE STROKE */}
        <h1 
          ref={textRef}
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