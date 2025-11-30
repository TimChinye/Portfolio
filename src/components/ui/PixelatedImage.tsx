"use client";

import React, { useEffect, useId, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import clsx from 'clsx';

interface PixelatedImageProps extends Omit<ImageProps, 'className'> {
  className?: string;
  wrapperClassName?: string;
  durationIn?: number;
  durationOut?: number;
  stepsIn?: number | 'max';
  stepsOut?: number | 'max';
  pixelationOut?: number;
  pixelationIn?: number;
  pixelationStart?: number;
}

export const PixelatedImage: React.FC<PixelatedImageProps> = ({
  className = '',
  wrapperClassName = '',
  durationIn,
  durationOut,
  stepsIn = 'max',
  stepsOut = 'max',
  pixelationOut = 32,
  pixelationIn = 1,
  pixelationStart = 1,
  alt,
  src,
  ...props
}) => {
  const filterId = useId();
  // Ensure the ID is valid for CSS selectors
  const uniqueFilterId = `pixelate-${filterId.replace(/[^a-zA-Z0-9-_]/g, '')}`;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const morphologyRef = useRef<SVGFEMorphologyElement>(null);
  const compositeRef = useRef<SVGFECompositeElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const currentRadiusRef = useRef<number>(pixelationStart);

  const defaults = {
    duration: 1000,
    pixelationOut: Math.max(1, pixelationOut),
    pixelationIn: Math.max(1, pixelationIn),
  };

  const setPixelationState = (radius: number) => {
    if (!containerRef.current || !morphologyRef.current || !compositeRef.current) return;

    const { offsetWidth, offsetHeight } = containerRef.current;

    // Guard against 0 dimensions causing Infinity/NaN
    if (offsetWidth <= 0 || offsetHeight <= 0) return;

    // Vanilla math
    const minNumBlocks = Math.max(2, Math.round(offsetWidth / (defaults.pixelationOut * 2)));
    const pixelWidthMax = offsetWidth / minNumBlocks;
    const pixelHeightMax = offsetHeight / minNumBlocks;

    currentRadiusRef.current = radius;

    const newRadiusPerc = radius / defaults.pixelationOut;
    
    const pixelWidth = newRadiusPerc * (pixelWidthMax - 1);
    const pixelHeight = newRadiusPerc * (pixelHeightMax - 1);

    const radiusX = pixelWidth / 2;
    const radiusY = pixelHeight / 2;

    // Direct DOM manipulation
    morphologyRef.current.setAttribute('radius', `${Math.max(0, radiusX)} ${Math.max(0, radiusY)}`);
    compositeRef.current.setAttribute('width', `${Math.max(0, pixelWidth)}`);
    compositeRef.current.setAttribute('height', `${Math.max(0, pixelHeight)}`);
  };

  const animatePixelation = (
    targetRadius: number,
    stepsToAnimate: number | 'max',
    durationMs: number
  ) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const startRadius = currentRadiusRef.current;
    const radiusChange = targetRadius - startRadius;
    let startTime: number | null = null;

    const animationStep = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / durationMs, 1);

      let effectiveProgress = progress;
      
      if (stepsToAnimate !== 'max' && stepsToAnimate > 0) {
        effectiveProgress = Math.ceil(progress * stepsToAnimate) / stepsToAnimate;
      }

      const newRadius = startRadius + (radiusChange * effectiveProgress);
      setPixelationState(newRadius);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animationStep);
      } else {
        requestRef.current = null;
        setPixelationState(targetRadius);
      }
    };

    requestRef.current = requestAnimationFrame(animationStep);
  };

  const handleMouseEnter = () => {
    const dur = durationIn ?? 500;
    animatePixelation(defaults.pixelationOut, stepsIn, dur);
  };

  const handleMouseLeave = () => {
    const dur = durationOut ?? 1000;
    animatePixelation(defaults.pixelationIn, stepsOut, dur);
  };

  useEffect(() => {
    // Initial State
    setPixelationState(pixelationStart);

    const handleResize = () => {
        setPixelationState(currentRadiusRef.current);
    };

    const observer = new ResizeObserver(() => {
       handleResize();
    });
    
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      ref={containerRef}
      className={clsx("relative inline-block overflow-hidden", wrapperClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ clipPath: 'inset(0)' }} 
    >
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0" 
        aria-hidden="true"
      >
        <filter 
            id={uniqueFilterId} 
            x="0" y="0" 
            width="100%" height="100%"
            // Force pixel units to match JS calculations
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
        >
          {/* Base Pixel: Black, Opaque, at 0,0 */}
          <feFlood 
            x="0" y="0" height="1" width="1" 
            floodColor="black" floodOpacity="1"
          />
          
          {/* Crop the flood to the calculated pixel size */}
          <feComposite 
            ref={compositeRef} 
            in2="SourceGraphic" 
            operator="in" 
            width="1" 
            height="1" 
          />
          
          {/* Tile the cropped pixel */}
          <feTile result="tiled" />
          
          {/* Mask the source image with the tiles */}
          <feComposite in="SourceGraphic" in2="tiled" operator="in" />
          
          {/* Expand the pixels to fill gaps */}
          <feMorphology 
            ref={morphologyRef} 
            operator="dilate" 
            radius="0" 
            result="pixelGrid" 
          />
          
          {/* Overlay pixelated version on top of source */}
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="pixelGrid" />
          </feMerge>
        </filter>
      </svg>

      <Image
        src={src}
        alt={alt}
        className={clsx("transition-transform duration-500 origin-top-left", className)}
        style={{ 
          filter: `url(#${uniqueFilterId})`,
          // transform: scale(1.125) matches the bleed required for dilate
          transform: 'scale(1.125)',
        }}
        {...props}
      />
    </div>
  );
};