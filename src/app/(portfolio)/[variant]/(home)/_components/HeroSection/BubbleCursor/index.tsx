"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Filter } from "./Filter";
import type { HeroProject } from "@/sanity/lib/queries";

const settings = {
  '--shadow-color' : 'hsl(0deg 0% 95%)',
  '--shadow-blur' : '15px',
  '--shadow-spread' : '-32px',
  '--shadow-offset' : '32px',
  '--tint-color' : 'hsl(0deg 0% 75%)',
  '--tint-opacity' : '0.5',
  '--frost-blur' : '2px',
  'noise-frequency' : '0.008',
  'distortion-strength' : '77',
  '--outer-shadow-blur' : '10px',
  '--rotate' : '0deg',
};

const supportsSvgBackdropFilter = () => {
    if (window.CSS.supports('-webkit-app-region', 'drag')) return true;

    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes('safari') && !ua.includes('chrome');
    const isFirefox = ua.includes('firefox');

    if (isSafari || isFirefox) return false;

    return true;
}

type BubbleCursorProps = {
  hoveredProject: HeroProject | null;
};

export function BubbleCursor({ hoveredProject }: BubbleCursorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const isTracking = useRef(false);

  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight * (7/8) : 0);

  useEffect(() => {
    setIsMounted(true);

    setIsSupported(supportsSvgBackdropFilter());
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 8);

    setViewportHeight(window.innerHeight);
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [mouseX, mouseY]);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();

  const zoomLevel = useTransform(
    scrollY,
    [0, viewportHeight * 0.75, viewportHeight],
    [1, 0.5, 0]
  );
  
  const hoverSpringConfig = { damping: 20, stiffness: 250, mass: 0.5 };
  const hoverScale = useSpring(1, hoverSpringConfig);

  useEffect(() => {
    hoverScale.set(hoveredProject ? 2 : 1);
  }, [hoveredProject, hoverScale]);

  // Combine scroll-based zoom and hover-based scale
  const finalScale = useTransform(
    [zoomLevel, hoverScale],
    ([z, h]: number[]) => z * h
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const unsubscribe = zoomLevel.on("change", (latestOpacity) => {
      const isCurrentlyActive = isTracking.current;

      if (latestOpacity > 0 && !isCurrentlyActive) {
        window.addEventListener("mousemove", handleMouseMove);
        isTracking.current = true;
      } else if (latestOpacity <= 0 && isCurrentlyActive) {
        window.removeEventListener("mousemove", handleMouseMove);
        isTracking.current = false;
      }
    });

    if (zoomLevel.get() > 0) {
        window.addEventListener("mousemove", handleMouseMove);
        isTracking.current = true;
    }

    // Cleanup
    return () => {
      unsubscribe();
      if (isTracking.current) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [zoomLevel, handleMouseMove]);

  if (!isMounted) return null;

  const bubbleText = hoveredProject ? hoveredProject.ctaPrimary.label : '';

  // HTML & CSS for the bubble
  const bubbleWrapperClasses = "fixed top-0 left-0 z-999 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-full container-size"
  const bubbleClasses = "size-32 shadow-[0px_6px_var(--outer-shadow-blur)_rgba(0,0,0,0.2)] before:rounded-[inherit] before:absolute before:inset-0 after:absolute after:inset-1 after:rounded-[inherit] after:bg-[rgb(from_var(--tint-color)_r_g_b_/_var(--tint-opacity))] after:shadow-[inset_var(--shadow-offset)_var(--shadow-offset)_var(--shadow-blur)_var(--shadow-spread)_var(--shadow-color),_inset_calc(-1_*_var(--shadow-offset))_calc(-1_*_var(--shadow-offset))_var(--shadow-blur)_var(--shadow-spread)_var(--shadow-color)] dark:after:invert-60"
  const liquidGlassClasses = "before:backdrop-filter-[blur(var(--frost-blur))_url(#glass-distortion)]";
  const frostedGlassClasses = "before:backdrop-filter-[blur(var(--frost-blur))]";

  const freq = settings['noise-frequency'];
  const scale = settings['distortion-strength'];
  const customProperties = Object.fromEntries(Object.entries(settings).filter(([key]) => key.startsWith('--')));

  return (
    <>
      {isSupported && <Filter baseFrequency={`${freq} ${freq}`} scale={scale} />}
      <motion.div
        data-html2canvas-ignore="true"
        style={{
          ...customProperties,
          x: smoothMouseX,
          y: smoothMouseY,
          scale: finalScale
        }}
        className={`${bubbleWrapperClasses} ${bubbleClasses} ${isSupported ? liquidGlassClasses : frostedGlassClasses}`}
      >
        <AnimatePresence>
          {hoveredProject && (
            <motion.div
              key="bubble-text"
              className="z-1 absolute inset-0 flex items-center justify-center text-center p-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span className="font-figtree font-bold text-white whitespace-nowrap text-[7.5cqw]">
                {bubbleText}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};