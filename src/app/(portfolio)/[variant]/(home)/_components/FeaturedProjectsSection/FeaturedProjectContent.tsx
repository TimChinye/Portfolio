"use client";

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { FeaturedProject } from '@/sanity/lib/queries';
import { motion, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';

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
    <div ref={containerRef} className="flex-1 flex flex-col gap-8 text-[5vw] font-bold leading-none container-size relative overflow-hidden">
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
        {/* --- FIX: Added m-0 to reset default margin --- */}
        <h1 className="text-[#948D00FF] text-[1.5em] leading-[inherit] m-0">
          {allWords.filter(w => w.type === 'title').map(({ word }, i) => (
            <span key={i} data-word-index={i} className="inline-block">{word}&nbsp;</span>
          ))}
        </h1>
        {/* --- FIX: Added m-0 to reset default margin --- */}
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
        className="absolute -z-1 w-[120%] h-[80%] -translate-x-1/2 -translate-y-1/2"
        style={{ x: '50cqw', y: '50cqh' }}
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