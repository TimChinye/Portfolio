"use client";

import { useRef, useEffect } from 'react';
import clsx from 'clsx';

type NoiseOverlayProps = {
  /**
   * Allows for additional positioning or styling classes.
   */
  className?: string;
  /**
   * A Tailwind CSS opacity class (e.g., 'opacity-10', 'opacity-20').
   * @default 'opacity-15'
   */
  opacityClass?: `opacity-${number}`;
  /**
   * Controls the "grain" size of the noise. Higher numbers mean larger grain.
   * @default 0.65
   */
  baseFrequency?: number;
  /**
   * The desired frames per second for the static animation.
   * Lower values are more performant.
   * @default 24
   */
  fps?: number;
};

const filterId = "noise-filter-overlay";

/**
 * A reusable component that creates a realistic, moving "TV static" effect.
 * It uses a performant SVG filter and a throttled requestAnimationFrame loop
 * to rapidly change the noise pattern.
 */
export const NoiseOverlay = ({
  className,
  opacityClass = 'opacity-15',
  baseFrequency = 0.5,
  fps = 24,
}: NoiseOverlayProps) => {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const turbulence = turbulenceRef.current;
    if (!turbulence) return;

    let frameId: number;
    // Throttling variables
    const fpsInterval = 1000 / fps;
    let then = Date.now();

    const animateNoise = () => {
      frameId = requestAnimationFrame(animateNoise);
      const now = Date.now();
      const elapsed = now - then;

      // Only update the frame if enough time has passed
      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        // Generate a new random seed to change the noise pattern
        const newSeed = Math.random() * 1000;
        turbulence.setAttribute('seed', newSeed.toString());
      }
    };

    // Start the animation loop
    frameId = requestAnimationFrame(animateNoise);

    // Cleanup function to stop the animation when the component unmounts
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [fps]); // Rerun the effect only if the fps prop changes

  return (
    <>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves="1"
              stitchTiles="stitch"
              result="turbulence" // Give this step a name
            />
            {/* Step 2: Recolor the noise to be black */}
            <feColorMatrix
              in="turbulence" // Use the output from the previous step
              type="matrix"
              // This matrix does two things:
              // 1. Sets the R, G, B channels to 0 (making the color black).
              // 2. Sets the Alpha channel to the value of the noise's brightness.
              values="0 0 0 0 0 
                      0 0 0 0 0 
                      0 0 0 0 0 
                      1 0 0 0 0"
            />
          </filter>
        </defs>
      </svg>
      <div
        className={clsx(
          'pointer-events-none absolute inset-0',
          opacityClass,
          className
        )}
        style={{ filter: `url(#${filterId})` }}
        data-html2canvas-ignore="true"
      />
    </>
  );
};