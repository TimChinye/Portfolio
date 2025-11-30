"use client";

import { motion, useTransform, useScroll, MotionValue } from "motion/react";
import clsx from "clsx";
import { RefObject } from "react";

const TEXT = "MOST RECENT PROJECTS";
const WORDS = TEXT.split(" ");

const FONT_SIZE = "text-[clamp(2.5rem,5vw,5rem)]"; 
const LETTER_SPACING = "tracking-[-0.05em]";

type AnimatedLetterProps = {
  char: string;
  index: number;
  totalChars: number;
  entryProgress: MotionValue<number>;
};

const AnimatedLetter = ({ char, index, totalChars, entryProgress }: AnimatedLetterProps) => {
  // Calculate delay based on distance from center to create a "U-shape" fall pattern.
  // Edges animate first (lighter), center animates last (heavier).
  const centerIndex = (totalChars - 1) / 2;
  const distFromCenter = Math.abs(index - centerIndex);
  const maxDist = totalChars / 2;
  const normalizedDist = distFromCenter / maxDist; 
  
  const start = 0.2 + normalizedDist * 0.3; 
  const end = start + 0.2;

  const y = useTransform(entryProgress, [start, end], ["-150%", "0%"], { clamp: true });

  return (
    <motion.span style={{ y }} className="inline-block h-full">
      {char}
    </motion.span>
  );
};

type SectionTitleProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  stickyProgress: MotionValue<number>;
};

export function SectionTitle({ containerRef, stickyProgress }: SectionTitleProps) {
  let globalCharIndex = 0;
  const totalChars = TEXT.replace(/ /g, "").length;

  const { scrollYProgress: entryProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.2"]
  });

  // Manually translate text up to simulate scrolling away while the parent container remains sticky
  const yExit = useTransform(stickyProgress, [0, 0.1], ["0%", "-200%"]);
  
  const underlineScaleX = useTransform(entryProgress, [0.75, 1], [0, 1], { clamp: true });

  return (
    <motion.div 
      className="absolute top-0 left-0 w-full flex justify-center pt-16 md:pt-24 z-10 pointer-events-none"
      style={{ y: yExit }}
    >
      <h2 
        className={clsx(
          "flex flex-wrap justify-center gap-x-[0.3em] gap-y-2",
          "font-figtree font-bold uppercase leading-[0.85]",
          "text-[#6F6B25] dark:text-[#EFEFD0]",
          FONT_SIZE,
          LETTER_SPACING
        )}
        aria-label={TEXT}
      >
        {WORDS.map((word, wordIndex) => {
          const isMost = word === "MOST";

          return (
            <div key={wordIndex} className="relative flex overflow-hidden py-[0.1em]">
              {word.split("").map((char, charIndex) => {
                const currentIndex = globalCharIndex;
                globalCharIndex++;

                return (
                  <AnimatedLetter
                    key={`${wordIndex}-${charIndex}`}
                    char={char}
                    index={currentIndex}
                    totalChars={totalChars}
                    entryProgress={entryProgress}
                  />
                );
              })}

              {isMost && (
                <motion.div
                  style={{ scaleX: underlineScaleX }}
                  className="absolute bottom-0 left-0 w-full h-[0.075em] bg-current origin-left"
                />
              )}
            </div>
          );
        })}
      </h2>
    </motion.div>
  );
}