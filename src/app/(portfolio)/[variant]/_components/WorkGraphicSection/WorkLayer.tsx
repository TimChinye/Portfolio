"use client";

import { motion, useTransform, useSpring, type MotionValue } from 'motion/react';
// Assuming Word is a component you have defined elsewhere
import { Word } from './Word';

type WorkLayerProps = {
  index: number;
  totalLayers: number;
  scrollYProgress: MotionValue<number>;
};

export function WorkLayer({ index, totalLayers, scrollYProgress }: WorkLayerProps) {
  const isLastLayer = index === totalLayers - 1;

  // --- THE "GOLDEN TRIANGLE" OF ANIMATION CONTROLS ---

  // How long does each word's individual (linear) animation last?
  const singleAnimationDuration = Math.pow(0.875, index);

  // When does the FIRST word begin moving?
  const sequenceStartPoint = 0;

  // When does the LAST word begin moving?
  const sequenceEndPoint = 0.875;

  // The power of the easing curve for the cascade.
  // 1.0 = Linear (all words start at evenly spaced intervals)
  // 2.0 = Quadratic Ease-In (words start slowly, then the starts get closer together)
  // 0.5 = Quadratic Ease-Out (words start in a rush, then the starts spread out)
  const cascadeEasingPower = 1.25;

  // --- END OF CONTROLS ---


  // --- NON-LINEAR STAGGER DERIVATION ---

  // Normalize the layer's position in the sequence (0 for the first, 1 for the last).
  // We use `totalLayers - 1` to ensure the final layer's index maps precisely to 1.0.
  const normalizedIndex = index / (totalLayers - 1);

  // Apply the easing function to the normalized index. This is our quadratic curve.
  // This transforms the linear index into a non-linear progress value.
  const easedProgress = Math.pow(normalizedIndex, cascadeEasingPower);

  // Calculate the total scroll duration available for the entire stagger sequence.
  const totalStaggerDuration = sequenceEndPoint - sequenceStartPoint;

  // Map the eased progress to the actual scroll timeline to find THIS layer's start time.
  const animationStart = sequenceStartPoint + (easedProgress * totalStaggerDuration);
  
  // The end time is simply the start time plus the duration of a single animation.
  const animationEnd = animationStart + singleAnimationDuration;

  // --- End of Derivations ---

  // This part of the code remains the same as it's doing its job perfectly.
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
      className="w-fit overflow-hidden"
      style={{
        height: isLastLayer ? "auto" : `calc(${clipperHeight})`
      }}
    >
      <motion.div
        style={{ y: isLastLayer ? "0" : y }}
        className="w-fit"
      >
        <Word isClipped={!isLastLayer} />
      </motion.div>
    </motion.div>
  );
}