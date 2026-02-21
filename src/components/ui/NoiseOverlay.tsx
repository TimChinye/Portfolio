"use client";

import { useRef, useEffect } from 'react';
import clsx from 'clsx';

type NoiseOverlayProps = {
  className?: string;
  opacityClass?: `opacity-${number}`;
  baseFrequency?: number;
  fps?: number;
};

const filterId = "noise-filter-overlay";

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

    frameId = requestAnimationFrame(animateNoise);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [fps]); 

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
              result="turbulence"
            />
            {/* Recolor the noise to be black and use brightness for alpha */}
            <feColorMatrix
              in="turbulence"
              type="matrix"
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
      />
    </>
  );
};