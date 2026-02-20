"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

type ScramblingTextProps = {
  textOptions: string[];
  onScrambleChange: (isActive: boolean) => void;
};

export function ScramblingText({ textOptions, onScrambleChange }: ScramblingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(textOptions[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetWidth, setTargetWidth] = useState<number | 'auto'>('auto');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      if (measurementRef.current && !isAnimating) {
        measurementRef.current.textContent = displayText;
        const width = measurementRef.current.offsetWidth;
        if (width > 0) {
          setTargetWidth(width);
        }
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isAnimating, displayText]);

  const scramble = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onScrambleChange(true);

    const nextIndex = (currentIndex + 1) % textOptions.length;
    const targetText = textOptions[nextIndex] || textOptions[0];

    if (measurementRef.current) {
      measurementRef.current.textContent = targetText;
      setTargetWidth(measurementRef.current.offsetWidth);
    }
    setCurrentIndex(nextIndex);

    let currentIteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        targetText.split('')
          .map((_, index) => (index < currentIteration ? targetText[index] : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join('')
      );

      if (currentIteration >= targetText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);

        onScrambleChange(false); 
        setIsAnimating(false);
      }
      currentIteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        onScrambleChange(false);
      }
    };
  }, [onScrambleChange]);

  return (
    <motion.div
      ref={containerRef}
      animate={{ width: targetWidth }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseEnter={scramble}
      className="relative overflow-hidden whitespace-nowrap"
    >
      {displayText}
      <span ref={measurementRef} className="absolute invisible -z-999" />
    </motion.div>
  );
}