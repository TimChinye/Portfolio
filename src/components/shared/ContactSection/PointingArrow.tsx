"use client";

import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';

import { useInView } from '@/hooks/useInView';
import { useWindowWidth } from '@/hooks/useWindowWidth';

import clsx from 'clsx';

// A helper function for clamping a value between a min and max
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

type PointingArrowProps = {
  className?: string;
  color: MotionValue<string>;
  baseScreenWidth?: number;
  headSize?: number;
  minHeadSize?: number;
  maxHeadSize?: number;
  lengthScale?: number;
  minLengthScale?: number;
  maxLengthScale?: number;
  strokeWidth?: number;
  minStrokeWidth?: number;
  maxStrokeWidth?: number;
  lengthRatio?: number;
};

export const PointingArrow = ({
  className,
  color,
  baseScreenWidth = 1920,
  headSize = 30,
  minHeadSize = 15,
  maxHeadSize = 40,
  lengthScale = 300,
  minLengthScale = 250,
  maxLengthScale = 500,
  strokeWidth = 12,
  minStrokeWidth = 6,
  maxStrokeWidth = 20,
  lengthRatio = 0.125,
}: PointingArrowProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(anchorRef, { rootMargin: '400px' });

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const lastRawAngle = useRef(0);
  const unwrappedAngle = useRef(0);
  const isFirstMoveAfterFocus = useRef(true);

  const rotation = useMotionValue(0);
  const shaftLength = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const smoothRotation = useSpring(rotation, springConfig);
  const smoothShaftLength = useSpring(shaftLength, springConfig);

  const windowWidth = useWindowWidth();

  const { dynamicStrokeWidth, dynamicHeadSize, dynamicLengthScale } = useMemo(() => {
    if (!hasMounted || windowWidth === 0) {
      return { dynamicStrokeWidth: strokeWidth, dynamicHeadSize: headSize, dynamicLengthScale: lengthScale };
    }
    const widthRatio = windowWidth / baseScreenWidth;
    const finalStrokeWidth = clamp(strokeWidth * widthRatio, minStrokeWidth, maxStrokeWidth);
    const finalHeadSize = clamp(headSize * widthRatio, minHeadSize, maxHeadSize);
    const finalLengthScale = clamp(lengthScale * (baseScreenWidth / windowWidth), minLengthScale, maxLengthScale);
    return { dynamicStrokeWidth: finalStrokeWidth, dynamicHeadSize: finalHeadSize, dynamicLengthScale: finalLengthScale };
  }, [hasMounted, windowWidth, baseScreenWidth, strokeWidth, minStrokeWidth, maxStrokeWidth, headSize, minHeadSize, maxHeadSize, lengthScale, minLengthScale, maxLengthScale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const dx = e.clientX - originX;
    const dy = e.clientY - originY;

    const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const distanceToCursor = Math.sqrt(dx * dx + dy * dy);
    const newShaftLength = distanceToCursor * lengthRatio;

    if (isFirstMoveAfterFocus.current) {
      unwrappedAngle.current = rawAngle;
      rotation.set(rawAngle);
      shaftLength.set(Math.max(0, newShaftLength));
      
      // --- THIS IS THE FIX ---
      // Call .set() with one argument to teleport the spring to its new value,
      // preventing the initial animation from 0.
      smoothRotation.set(rawAngle);
      smoothShaftLength.set(Math.max(0, newShaftLength));
      
      isFirstMoveAfterFocus.current = false;
    } else {
      const diff = rawAngle - lastRawAngle.current;
      if (Math.abs(diff) > 180) {
        unwrappedAngle.current += diff > 0 ? -360 : 360;
      }
      unwrappedAngle.current += rawAngle - lastRawAngle.current;
      rotation.set(unwrappedAngle.current);
      shaftLength.set(Math.min(Math.max(0, newShaftLength), 250));
    }
    lastRawAngle.current = rawAngle;
  }, [rotation, shaftLength, lengthRatio, smoothRotation, smoothShaftLength]);

  useEffect(() => {
    const handleFocus = () => { isFirstMoveAfterFocus.current = true; };
    
    if (isInView) {
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousemove', handleMouseMove);
    };
    }
  }, [isInView, handleMouseMove]);

  const svgSize = dynamicLengthScale + dynamicHeadSize + dynamicStrokeWidth;
  const svgCenter = svgSize / 2;
  const lineEndX = useTransform(smoothShaftLength, (l) => svgCenter + l);
  const headTranslateX = useTransform(smoothShaftLength, (l) => svgCenter + l);

  return (
    <div
      ref={anchorRef}
      className={clsx('pointing-arrow contain-layout absolute w-px h-px', className)}
      aria-hidden="true"
      data-html2canvas-ignore="true"
    >
      <motion.svg
        key={svgSize}
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="absolute"
        style={{
          left: `-${svgSize / 2}px`,
          top: `-${svgSize / 2}px`,
          color: color,
          rotate: smoothRotation,
          transformOrigin: 'center center'
        }}
        overflow="visible"
      >
        <g>
          <motion.line x1={svgCenter} y1={svgCenter} x2={lineEndX} y2={svgCenter} stroke="currentColor" strokeWidth={dynamicStrokeWidth} strokeLinecap="round" />
          <motion.g style={{ translateX: headTranslateX, translateY: svgCenter }}>
            <line x1={0} y1={0} x2={-dynamicHeadSize} y2={-dynamicHeadSize} stroke="currentColor" strokeWidth={dynamicStrokeWidth} strokeLinecap="round" />
            <line x1={0} y1={0} x2={-dynamicHeadSize} y2={dynamicHeadSize} stroke="currentColor" strokeWidth={dynamicStrokeWidth} strokeLinecap="round" />
          </motion.g>
        </g>
      </motion.svg>
    </div>
  );
};