// src/components/ContactSection/Marquee.tsx
"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  useAnimationFrame,
} from "motion/react";
import { wrap } from "motion";
import clsx from "clsx";

import { PortfolioIcon } from "@/components/ui/PortfolioIcon";

const DefaultSeparator = React.memo(() => (
  <PortfolioIcon
    className="h-[0.75em] w-auto shrink-0 self-center text-black dark:text-white"
    aria-hidden="true"
  />
));

DefaultSeparator.displayName = 'DefaultSeparator';

interface MarqueeProps {
  children: React.ReactNode;
  /** The base translating speed in pixels per second. Default: 100 */
  baseVelocity?: number;
  /** The translating speed when the user hovers over the component. Default: 20 */
  hoverVelocity?: number;
  separator?: React.ReactNode;
  className?: string;
  textColor?: string;
  hoverTextColor?: string;
}

export function Marquee({
  children,
  baseVelocity = 100,
  hoverVelocity = 20,
  separator = <DefaultSeparator />,
  className,
  textColor = "text-black dark:text-[#F5F5EF]",
  hoverTextColor = "group-hover:text-[#D9D24D]",
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const translationRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);

  const [repetitions, setRepetitions] = useState(1);
  const loopWidth = useRef(0);

  // This is the core logic: measure everything to calculate the loop width
  useLayoutEffect(() => {
    const calculateMetrics = () => {
      if (!containerRef.current || !translationRef.current || !textRef.current || !separatorRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const translationStyle = window.getComputedStyle(translationRef.current);
      const gapWidth = parseFloat(translationStyle.gap) || 0;

      const textWidth = textRef.current.offsetWidth;
      const separatorWidth = separatorRef.current.offsetWidth;

      // The width of a single, complete loop is the text, the separator, and the two gaps around them.
      const singleLoopWidth = textWidth + separatorWidth + (gapWidth * 2);
      loopWidth.current = singleLoopWidth;

      const requiredReps = Math.ceil(containerWidth / singleLoopWidth) + 1;
      setRepetitions(requiredReps);
    };

    calculateMetrics();

    const resizeObserver = new ResizeObserver(calculateMetrics);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [children, separator]);

  const baseX = useMotionValue(0);
  const targetVelocity = useMotionValue(baseVelocity);
  const smoothVelocity = useSpring(targetVelocity, { damping: 40, stiffness: 300 });

  useAnimationFrame((_t, delta) => {
    if (!loopWidth.current) return;
    let moveBy = smoothVelocity.get() * (delta / 1000);
    baseX.set(wrap(0, -loopWidth.current, baseX.get() - moveBy));
  });

  const handleMouseEnter = () => targetVelocity.set(hoverVelocity);
  const handleMouseLeave = () => targetVelocity.set(baseVelocity);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "marquee group w-full cursor-pointer overflow-hidden whitespace-nowrap text-[8rem] leading-0",
        "[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={translationRef}
        className="inline-flex flex-nowrap items-center font-bold uppercase gap-[0.75ch]"
        style={{ x: baseX }}
      >
        {/* Your original HTML structure is preserved here, rendered dynamically */}
        {Array.from({ length: repetitions }).map((_, i) => (
          <React.Fragment key={i}>
            <span
              ref={i === 0 ? textRef : null} // Measure the first text span
              className={clsx("transition-colors duration-500 ease-in-out", textColor, hoverTextColor)}
            >
              {children}
            </span>
            <div
              ref={i === 0 ? separatorRef : null} // Measure the first separator
              className="flex shrink-0 items-center"
            >
              {separator}
            </div>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}