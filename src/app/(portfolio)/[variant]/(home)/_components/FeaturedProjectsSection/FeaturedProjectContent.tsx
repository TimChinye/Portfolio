// src/app/(portfolio)/[variant]/(home)/_components/FeaturedProjectsSection/FeaturedProjectContent.tsx
"use client";

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { FeaturedProject } from '@/sanity/lib/queries';
import { motion, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';

// --- CONFIGURATION ---
const BG_CONFIG = {
  SCALE: 0.5,           // Image size (0.5 = 50% of original size)
  DRIFT_DISTANCE: 10,   // Constant distance the image moves (in % of container)
  CURVE_MIN: -10,       // Minimum arc strength (Negative for one direction)
  CURVE_MAX: 10,        // Maximum arc strength (Positive for the other)
};
// --- END CONFIGURATION ---

// Represents the measured properties of a single line of text
type LineMetrics = {
  offsetTop: number;
  offsetHeight: number;
};

// Component for a single animated word
type AnimatedWordProps = {
  word: string;
  wordIndex: number;
  wordToLineMap: React.RefObject<number[]>;
  highlightedLineIndex: MotionValue<number | null>;
};

function AnimatedWord({ word, wordIndex, wordToLineMap, highlightedLineIndex }: AnimatedWordProps) {
  const currentLineIndex = wordToLineMap.current[wordIndex];

  const opacity = useTransform(highlightedLineIndex, (latestHighlightIndex) => {
    return latestHighlightIndex === currentLineIndex ? 1.0 : 0.5;
  });

  const highlighted = highlightedLineIndex.get() == currentLineIndex;

  return (
    <motion.span style={{ opacity, x: highlighted ? '0.25ch' : '0' }} className="inline-block transition-transform duration-500">
      {word}&nbsp;
    </motion.span>
  );
}

type FeaturedProjectContentProps = {
  activeProject: FeaturedProject;
  scrollYProgress: MotionValue<number>;
  setContentProgress: (progress: number) => void;
};

export function FeaturedProjectContent({
  activeProject,
  scrollYProgress,
  setContentProgress,
}: FeaturedProjectContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordToLineMap = useRef<number[]>([]);
  const lineMetrics = useRef<LineMetrics[]>([]);
  const lastHighlightedIndexRef = useRef<number | null>(0);
  const [isMeasured, setIsMeasured] = useState(false);

  const [coords, setCoords] = useState<{
    start: { x: number, y: number },
    end: { x: number, y: number },
    control: { x: number, y: number }
  } | null>(null);

  useEffect(() => {
    // 1. Random Start Position (Keep within 20-80% to avoid edge clipping)
    const startX = 20 + Math.random() * 60;
    const startY = 20 + Math.random() * 60;

    // 2. End Position (Based on constant DRIFT_DISTANCE)
    const angle = Math.random() * 2 * Math.PI; // Random direction
    const endX = startX + (Math.cos(angle) * BG_CONFIG.DRIFT_DISTANCE);
    const endY = startY + (Math.sin(angle) * BG_CONFIG.DRIFT_DISTANCE);

    // 3. Curve Control Point (Quadratic Bezier)
    // Find midpoint
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Determine curve strength randomly between MIN and MAX
    const strength = BG_CONFIG.CURVE_MIN + Math.random() * (BG_CONFIG.CURVE_MAX - BG_CONFIG.CURVE_MIN);
    
    // Calculate perpendicular angle to the drift direction
    const perpAngle = angle + (Math.PI / 2);

    // Offset midpoint by strength in the perpendicular direction
    const controlX = midX + Math.cos(perpAngle) * strength;
    const controlY = midY + Math.sin(perpAngle) * strength;

    setCoords({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      control: { x: controlX, y: controlY }
    });
  }, []); // Runs once on mount

  // Quadratic Bezier Interpolation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
  const bgLeft = useTransform(scrollYProgress, (t) => {
    if (!coords) return "50%";
    const p0 = coords.start.x;
    const p1 = coords.control.x;
    const p2 = coords.end.x;
    const val = (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    return `${val}%`;
  });

  const bgTop = useTransform(scrollYProgress, (t) => {
    if (!coords) return "50%";
    const p0 = coords.start.y;
    const p1 = coords.control.y;
    const p2 = coords.end.y;
    const val = (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    return `${val}%`;
  });

  const allWords = [
    ...activeProject.title.split(' ').map(word => ({ word, type: 'title' as const })),
    ...activeProject.featuredDescription.split(/\s+/).map(word => ({ word, type: 'description' as const })),
  ];

  const measureLayout = () => {
    const container = containerRef.current;
    if (!container) return;

    const wordSpans = Array.from(container.querySelectorAll<HTMLSpanElement>('[data-word-index]'));
    if (wordSpans.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;

    const newWordToLineMap: number[] = [];
    const newLineMetrics: LineMetrics[] = [];
    let currentLineIndex = -1;
    let lastRelativeTop = -999;

    wordSpans.forEach((span, index) => {
      const wordRect = span.getBoundingClientRect();
      const relativeTop = wordRect.top - containerTop;
      const { offsetHeight } = span;

      if (Math.abs(relativeTop - lastRelativeTop) > 1) {
        currentLineIndex++;
        lastRelativeTop = relativeTop;
        newLineMetrics[currentLineIndex] = { offsetTop: relativeTop, offsetHeight };
      }
      newWordToLineMap[index] = currentLineIndex;
    });

    wordToLineMap.current = newWordToLineMap;
    lineMetrics.current = newLineMetrics;
    setIsMeasured(true);
  };

  useLayoutEffect(measureLayout, [activeProject]);
  useEffect(() => {
    const handleResize = () => {
      setIsMeasured(false);
      requestAnimationFrame(measureLayout);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setContentProgress(latest * 100);
    });
    return () => unsubscribe();
  }, [scrollYProgress, setContentProgress]);

  const containerHeight = containerRef.current?.offsetHeight ?? 0;
  const firstLine = lineMetrics.current[0];
  const lastLine = lineMetrics.current[lineMetrics.current.length - 1];

  const startTranslateY = firstLine ? (containerHeight / 2) - (firstLine.offsetTop + firstLine.offsetHeight / 2) : 0;
  const endTranslateY = lastLine ? (containerHeight / 2) - (lastLine.offsetTop + lastLine.offsetHeight / 2) : 0;

  const textTranslateY = useTransform(scrollYProgress, [0, 1], [startTranslateY, endTranslateY]);

  const highlightedLineIndex = useTransform(textTranslateY, (y) => {
    if (!isMeasured || lineMetrics.current.length === 0) return lastHighlightedIndexRef.current;

    const highlightZoneTop = containerHeight * 0.4;
    const highlightZoneBottom = containerHeight * 0.5;

    const linesInZone = lineMetrics.current
      .map((line, index) => ({ ...line, index }))
      .filter(line => {
        const lineTop = line.offsetTop + y;
        const lineBottom = lineTop + line.offsetHeight;
        return lineTop < highlightZoneBottom && lineBottom > highlightZoneTop;
      });

    if (linesInZone.length > 0) {
      const highlightedLine = linesInZone.reduce((prev, curr) => (curr.offsetTop > prev.offsetTop ? curr : prev));
      lastHighlightedIndexRef.current = highlightedLine.index;
      return highlightedLine.index;
    }
    return lastHighlightedIndexRef.current;
  });

  return (
    <div ref={containerRef} className="flex-1 flex flex-col gap-8 text-[5vw] font-bold leading-none container-size relative">
      <motion.div
        className="absolute top-0 left-0 w-full"
        style={{ y: isMeasured ? textTranslateY : 0, opacity: isMeasured ? 1 : 0 }}
        aria-hidden={!isMeasured}
      >
        <h1 className="text-[#948D00] dark:text-[#E4E191] text-[1.5em] leading-[inherit] m-0">
          {allWords.filter(w => w.type === 'title').map(({ word }, i) => (
            <AnimatedWord
              key={`title-${i}`}
              word={word}
              wordIndex={i}
              wordToLineMap={wordToLineMap}
              highlightedLineIndex={highlightedLineIndex}
            />
          ))}
        </h1>

        <p className="text-[#3D3B0D] dark:text-[#EFEFD0] leading-[inherit] m-0">
          {allWords.filter(w => w.type === 'description').map(({ word }, i) => {
            const titleWordCount = allWords.filter(w => w.type === 'title').length;
            return (
              <AnimatedWord
                key={`desc-${i}`}
                word={word}
                wordIndex={titleWordCount + i}
                wordToLineMap={wordToLineMap}
                highlightedLineIndex={highlightedLineIndex}
              />
            );
          })}
        </p>
      </motion.div>

      <div style={{ opacity: 0, pointerEvents: 'none', visibility: isMeasured ? 'hidden' : 'visible' }}>
        <h1 className="text-[#948D00FF] text-[1.5em] leading-[inherit] m-0">
          {allWords.filter(w => w.type === 'title').map(({ word }, i) => (
            <span key={i} data-word-index={i} className="inline-block">{word}&nbsp;</span>
          ))}
        </h1>
        <p className="text-[#3D3B0D80] leading-[inherit] m-0">
          {allWords.filter(w => w.type === 'description').map(({ word }, i) => {
            const titleWordCount = allWords.filter(w => w.type === 'title').length;
            return (
              <span key={i} data-word-index={titleWordCount + i} className="inline-block">{word}&nbsp;</span>
            );
          })}
        </p>
      </div>

      <motion.div
        className="absolute -z-1 w-[120%] h-[80%] -translate-1/2"
        style={{
          left: bgLeft,
          top: bgTop,
          scale: BG_CONFIG.SCALE,
          opacity: coords ? 1 : 0,
          transition: 'opacity 0.5s ease-in'
        }}
      >
        <Image
          src={activeProject.thumbnailUrl}
          alt={`Background for ${activeProject.title}`}
          fill
          sizes="120vw"
          className="object-contain blur opacity-20 dark:opacity-10"
          priority
        />
      </motion.div>
    </div>
  );
}