"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';

import { useInView } from '@/hooks/useInView';
import { useWindowWidth } from '@/hooks/useWindowWidth';

import clsx from 'clsx';

// A helper function for clamping a value between a min and max
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

type PointingArrowProps = {
  className?: string;
  color: MotionValue<string>;
  initRotation?: number;
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
  initRotation = 0,
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

  const lastRawAngle = useRef(initRotation);
  const unwrappedAngle = useRef(initRotation);
  const isFirstMoveAfterFocus = useRef(true);
  
  const cursorPositionRef = useRef({ x: 0, y: 0 });

  const rotation = useMotionValue(initRotation);
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

  const updateArrowTransform = useCallback((cursorX: number, cursorY: number) => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const dx = cursorX - originX;
    const dy = cursorY - originY;

    const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const distanceToCursor = Math.sqrt(dx * dx + dy * dy);
    const newShaftLength = distanceToCursor * lengthRatio;

    if (isFirstMoveAfterFocus.current) {
      const currentAngle = unwrappedAngle.current;
      
      // Find the difference and normalize it to the shortest path (-180 to 180)
      let diff = rawAngle - currentAngle;

      if (diff > 180) diff -= 360;
      else if (diff < -180) diff += 360;
      
      const targetAngle = currentAngle + diff;

      unwrappedAngle.current = targetAngle;
      rotation.set(targetAngle);
      shaftLength.set(Math.max(0, newShaftLength));
      smoothShaftLength.set(Math.max(0, newShaftLength));
      
      isFirstMoveAfterFocus.current = false;
    } else {
      const diff = rawAngle - lastRawAngle.current;
      let newUnwrappedAngle = unwrappedAngle.current;

      if (Math.abs(diff) > 180) {
        newUnwrappedAngle += diff > 0 ? -360 : 360;
      }
      newUnwrappedAngle += rawAngle - lastRawAngle.current;

      unwrappedAngle.current = newUnwrappedAngle;
      rotation.set(newUnwrappedAngle);
      shaftLength.set(Math.min(Math.max(0, newShaftLength), 250));
    }
    lastRawAngle.current = rawAngle;
  }, [rotation, shaftLength, lengthRatio, smoothShaftLength]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
    cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    updateArrowTransform(e.clientX, e.clientY);
  }, [updateArrowTransform]);

  // NEW: A handler for the scroll event
  const handleScroll = useCallback(() => {
    // Don't do anything if we haven't moved the mouse yet
    if (cursorPositionRef.current.x === 0 && cursorPositionRef.current.y === 0) {
      return;
    }
    updateArrowTransform(cursorPositionRef.current.x, cursorPositionRef.current.y);
  }, [updateArrowTransform]);

  useEffect(() => {
    const handleFocus = () => { isFirstMoveAfterFocus.current = true; };
    
    if (isInView) {
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
    }
  }, [isInView, handleMouseMove, handleScroll]);

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