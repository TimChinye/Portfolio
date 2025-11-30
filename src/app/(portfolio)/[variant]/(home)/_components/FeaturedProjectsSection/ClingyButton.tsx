"use client";

import { forwardRef, useRef, useEffect, useCallback } from 'react';
import { animate, motion, useMotionValue, useSpring } from 'motion/react';
import clsx from 'clsx';

type ClingyButtonProps = {
  children: React.ReactNode;
  className?: string;
  maxOffset?: number;
  gravityFactor?: number;
  pullFactor?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ClingyButton = forwardRef<HTMLButtonElement, ClingyButtonProps>(
  ({
    children,
    className,
    maxOffset = 0.2,
    gravityFactor = 1.25,
    pullFactor = 0.15,
    onAnimationStart,
    onDrag,
    onDragStart,
    onDragEnd,
    ...otherProps
  }, forwardedRef) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    
    // MotionValues to hold the target x/y position for the shadow
    const targetOffsetX = useMotionValue(0);
    const targetOffsetY = useMotionValue(0);

    // Update CSS variables for the shadow offset using a spring subscription
    useEffect(() => {
      const button = internalRef.current;
      if (!button) return;

      const updateCSSVariables = () => {
        button.style.setProperty('--offset-x', `${targetOffsetX.get()}px`);
        button.style.setProperty('--offset-y', `${targetOffsetY.get()}px`);
      };

      const unsubX = targetOffsetX.on("change", updateCSSVariables);
      const unsubY = targetOffsetY.on("change", updateCSSVariables);

      return () => {
        unsubX();
        unsubY();
      };
    }, [targetOffsetX, targetOffsetY]);

    const gravityX = useMotionValue(0);
    const smoothGravityX = useSpring(gravityX, { stiffness: 400, damping: 25, mass: 0.5 });

    // Handle magnetic tracking logic
    useEffect(() => {
      const handleWindowMouseMove = (e: MouseEvent) => {
        const button = internalRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        // Horizontal distance from cursor to the button's center
        const distanceX = e.clientX - (rect.left + rect.width / 2);
        
        // The "zone of influence" where gravity is active
        const gravityZone = rect.width * gravityFactor;

        if (Math.abs(distanceX) < gravityZone) {
          const pullRatio = 1 - (Math.abs(distanceX) / gravityZone);
          const easedPullRatio = 1 - Math.pow(1 - pullRatio, 3);
          
          const targetX = distanceX * easedPullRatio * pullFactor;
          gravityX.set(targetX);
        } else {
          gravityX.set(0);
        }
      };

      window.addEventListener('mousemove', handleWindowMouseMove);
      return () => window.removeEventListener('mousemove', handleWindowMouseMove);
    }, [gravityFactor, pullFactor, gravityX]);

    const setRefs = useCallback((node: HTMLButtonElement) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    }, [forwardedRef]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = internalRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const deltaX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const deltaY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      const maxPixelOffset = button.clientWidth * maxOffset;
      const targetX = deltaX * maxPixelOffset;
      const targetY = deltaY * maxPixelOffset;

      animate(targetOffsetX, targetX, { type: 'spring', stiffness: 400, damping: 30, mass: 0.5 });
      animate(targetOffsetY, targetY, { type: 'spring', stiffness: 400, damping: 30, mass: 0.5 });
    };

    const handleMouseLeave = () => {
      animate(targetOffsetX, 0, { type: 'spring', stiffness: 400, damping: 6 });
      animate(targetOffsetY, 0, { type: 'spring', stiffness: 400, damping: 6 });
    };

    return (
        <motion.button
            ref={setRefs}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: smoothGravityX }}
            className={clsx(`
                bg-[#7A751A] dark:bg-[#EFEFD0]
                text-[#3D3B0D] dark:text-[#9a996b]
                relative w-fit aspect-square rounded-full cursor-pointer border-none outline-none
                inline-block text-center content-center translate-0
                p-[2.125em] text-[7.5cqw] font-bold uppercase whitespace-nowrap

                after:absolute after:-z-10 after:-inset-px after:rounded-[inherit]
                after:border-4 after:border-[#7A751A] dark:after:border-[#EFEFD0]
                after:bg-[#EFEFD0] dark:after:bg-[#1A1A17]

                after:translate-x-(--offset-x) after:translate-y-(--offset-y)
            `, className)}
            {...otherProps}
        >
            {children}
        </motion.button>
    );
  }
);

ClingyButton.displayName = 'ClingyButton';