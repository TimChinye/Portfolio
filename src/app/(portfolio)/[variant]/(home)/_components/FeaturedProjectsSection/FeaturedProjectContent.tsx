"use client";

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { FeaturedProject } from '@/sanity/lib/queries';
import { motion, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';

const BG_CONFIG = {
  SCALE: 0.5,           // Image size (0.5 = 50% of original size)
  DRIFT_DISTANCE: 10,   // Constant distance the image moves (in % of container)
  CURVE_MIN: -10,       // Minimum arc strength (Negative for one direction)
  CURVE_MAX: 10,        // Maximum arc strength (Positive for the other)
};

type LineMetrics = {
  offsetTop: number;
  offsetHeight: number;
};

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
    // Random Start Position (with 20% padding to avoid edge clipping)
    const padding = 20;
    const startX = padding + Math.random() * (100 - (padding * 2));
    const startY = padding + Math.random() * (100 - (padding * 2));

    // Define End Position
    const angle = Math.random() * 2 * Math.PI; // Random direction
    const endX = startX + (Math.cos(angle) * BG_CONFIG.DRIFT_DISTANCE);
    const endY = startY + (Math.sin(angle) * BG_CONFIG.DRIFT_DISTANCE);

    // Create curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const strength = BG_CONFIG.CURVE_MIN + Math.random() * (BG_CONFIG.CURVE_MAX - BG_CONFIG.CURVE_MIN);
    
    // Offset midpoint by strength in the perpendicular direction
    const perpAngle = angle + (Math.PI / 2);
    const controlX = midX + Math.cos(perpAngle) * strength;
    const controlY = midY + Math.sin(perpAngle) * strength;

    setCoords({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      control: { x: controlX, y: controlY }
    });
  }, []);

  // Quadratic Bezier Interpolation (to make it smooth, curved and 'natural'):
  // https://stackoverflow.com/questions/1074395/quadratic-bezier-interpolation -> P(t) = P0*(1-t)^2 + P1*2*(1-t)*t + P2*t^2
  const bgLeft = useTransform(scrollYProgress, (t) => {
    if (!coords) return "50%";
 
    const p0 = coords.start.x;
    const p1 = coords.control.x;
    const p2 = coords.end.x;

    const val = (p0 * Math.pow((1 - t), 2)) + (p1 * 2 * (1 - t) * t) + (p2 * Math.pow(t, 2));
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

  const titleWords = activeProject.title.split(' ').map(word => ({ word, type: 'title' as const }));
  const descriptionLines = ("\n" + activeProject.featuredDescription).split('\n').map(line => {
    const words = line.split(/\s+/).filter(Boolean);
    return words.length === 0 ? [""] : words;
  });

  const allWords = [
    ...titleWords,
    ...descriptionLines.flat().map(word => ({ word, type: 'description' as const })),
  ];

  // Measure DOM elements in the hidden ghost layer to group words into lines
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

      // Detect line break via change in vertical position
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

  // Calculate translation range to keep text vertically centered at start/end of scroll
  const startTranslateY = firstLine ? (containerHeight / 2) - (firstLine.offsetTop + firstLine.offsetHeight / 2) : 0;
  const endTranslateY = lastLine ? (containerHeight / 2) - (lastLine.offsetTop + lastLine.offsetHeight / 2) : 0;

  const textTranslateY = useTransform(scrollYProgress, [0, 1], [startTranslateY, endTranslateY]);

  // Determine active line index based on intersection with the center "highlight zone"
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
    <div ref={containerRef} className="flex-1 flex flex-col gap-8 text-[4vw] font-bold leading-none container-size relative">
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
          {descriptionLines.map((line, lineIdx) => (
            <span key={lineIdx} className="block">
              {line.map((word, i) => {
                const titleWordCount = titleWords.length;
                const prevLinesWordCount = descriptionLines.slice(0, lineIdx).flat().length;
                return (
                  <AnimatedWord
                    key={`desc-${lineIdx}-${i}`}
                    word={word}
                    wordIndex={titleWordCount + prevLinesWordCount + i}
                    wordToLineMap={wordToLineMap}
                    highlightedLineIndex={highlightedLineIndex}
                  />
                );
              })}
            </span>
          ))}
        </p>
      </motion.div>

      {/* Hidden "ghost" layer strictly for layout measurement */}
      <div style={{ opacity: 0, pointerEvents: 'none', visibility: isMeasured ? 'hidden' : 'visible' }}>
        <h1 className="text-[#948D00FF] text-[1.5em] leading-[inherit] m-0">
          {titleWords.map(({ word }, i) => (
            <span key={i} data-word-index={i} className="inline-block">{word}&nbsp;</span>
          ))}
        </h1>
        <p className="text-[#3D3B0D80] leading-[inherit] m-0">
          {descriptionLines.map((line, lineIdx) => (
            <span key={lineIdx} className="block">
              {line.map((word, i) => {
                const titleWordCount = titleWords.length;
                const prevLinesWordCount = descriptionLines.slice(0, lineIdx).flat().length;
                return (
                  <span key={`${lineIdx}-${i}`} data-word-index={titleWordCount + prevLinesWordCount + i} className="inline-block">{word || "\u00A0"}&nbsp;</span>
                );
              })}
            </span>
          ))}
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