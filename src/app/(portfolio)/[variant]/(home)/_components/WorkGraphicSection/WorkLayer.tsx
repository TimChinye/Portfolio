"use client";

import { motion, useTransform, useSpring, type MotionValue } from 'motion/react';
import clsx from 'clsx';
import { Word } from './Word';

type WorkLayerProps = {
  index: number;
  totalLayers: number;
  scrollYProgress: MotionValue<number>;
};

export function WorkLayer({ index, totalLayers, scrollYProgress }: WorkLayerProps) {
  const isLastLayer = index === totalLayers - 1;

  // THE "GOLDEN TRIANGLE" OF ANIMATION CONTROLS
  const singleAnimationDuration = Math.pow(0.875, index);
  const sequenceStartPoint = 0;
  const sequenceEndPoint = 0.875;
  const cascadeEasingPower = 1.25;

  // NON-LINEAR STAGGER DERIVATION
  const normalizedIndex = index / (totalLayers - 1);
  const easedProgress = Math.pow(normalizedIndex, cascadeEasingPower);
  const totalStaggerDuration = sequenceEndPoint - sequenceStartPoint;
  const animationStart = sequenceStartPoint + (easedProgress * totalStaggerDuration);
  const animationEnd = animationStart + singleAnimationDuration;

  const translateY = useTransform(
    scrollYProgress,
    [animationStart, animationEnd],
    [0, 100],
    { clamp: true }
  );

  const smoothTranslateY = useSpring(translateY, {
    stiffness: 2500,
    damping: 125,
    mass: 0.625,
  });
  
  const initHeight = 0.1;
  const clipperHeight = `(${initHeight} + (${index / totalLayers} * ${1 - initHeight})) * 0.333em`;
  
  const y = useTransform(smoothTranslateY, v => `${v}%`);

  return (
    <motion.div
      // MODIFIED: Only hide overflow on the transition layers (clipped ones).
      // The last layer needs to be visible when translating up.
      className={clsx("w-fit", !isLastLayer && "overflow-hidden")}
      style={{
        height: isLastLayer ? "auto" : `calc(${clipperHeight})`
      }}
    >
      <motion.div
        style={{ y: isLastLayer ? "0.5rem" : y }}
        className="w-fit"
      >
        <Word isClipped={!isLastLayer} />
      </motion.div>
    </motion.div>
  );
}