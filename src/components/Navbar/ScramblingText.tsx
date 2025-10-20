"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

type ScramblingTextProps = {
  textOptions: string[];
};

export function ScramblingText({ textOptions }: ScramblingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(textOptions[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetWidth, setTargetWidth] = useState<number | 'auto'>('auto');
  const [isScramblingActive, setIsScramblingActive] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setTargetWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const scramble = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsScramblingActive(true);

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

        setIsScramblingActive(false); 
        setIsAnimating(false);
      }
      currentIteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setIsScramblingActive(false);
      }
    };
  }, [setIsScramblingActive]);

  return (
    <motion.div
      ref={containerRef}
      animate={{ width: targetWidth }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseEnter={scramble}
      className="relative overflow-hidden whitespace-nowrap"
    >
      {displayText}
      <span ref={measurementRef} className="absolute invisible -z-10" />
    </motion.div>
  );
}