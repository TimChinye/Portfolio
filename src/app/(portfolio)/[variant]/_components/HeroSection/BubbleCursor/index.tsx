"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "motion/react";
import { Filter } from "./Filter";

// Settings derived from the prompt
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

// Function to check for support
const supportsSvgBackdropFilter = () => {
    if (window.CSS.supports('-webkit-app-region', 'drag')) return true;

    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes('safari') && !ua.includes('chrome');
    const isFirefox = ua.includes('firefox');

    if (isSafari || isFirefox) return false;

    return true;
}

export function BubbleCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const isTracking = useRef(false);

  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight * (7/8) : 0);

  // Effect to run on the client-side only
  useEffect(() => {
    setIsMounted(true);

    setIsSupported(supportsSvgBackdropFilter());
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 8);

    // Get the viewport height and set up a listener for window resize
    setViewportHeight(window.innerHeight);
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();

  const zoomLevel = useTransform(
    scrollY,
    [0, viewportHeight * 0.75, viewportHeight],
    [1, 0.5, 0]
  );

  // --- OPTIMIZATION LOGIC ---
  // Wrap handleMouseMove in useCallback to ensure its reference is stable.
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

  if (!isMounted) {
    return null;
  }

  // --- HTML & CSS for the bubble ---
                        
  const bubbleWrapperClasses = "fixed top-0 left-0 z-9999 rounded-full -translate-x-1/2 -translate-y-1/2 overflow-hidden"
  const bubbleClasses = "size-32 pointer-events-none rounded-[inherit] shadow-[0px_6px_var(--outer-shadow-blur)_rgba(0,0,0,0.2)] before:absolute before:inset-0 after:absolute after:inset-1 after:rounded-[inherit] after:bg-[rgb(from_var(--tint-color)_r_g_b_/_var(--tint-opacity))] after:shadow-[inset_var(--shadow-offset)_var(--shadow-offset)_var(--shadow-blur)_var(--shadow-spread)_var(--shadow-color),_inset_calc(-1_*_var(--shadow-offset))_calc(-1_*_var(--shadow-offset))_var(--shadow-blur)_var(--shadow-spread)_var(--shadow-color)] dark:after:invert-60"
  const liquidGlassClasses = "before:backdrop-filter-[blur(var(--frost-blur))_url(#glass-distortion)]";
  const frostedGlassClasses = "before:backdrop-filter-[blur(var(--frost-blur))]";

  const freq = settings['noise-frequency'];
  const scale = settings['distortion-strength'];
  const customProperties = Object.fromEntries(Object.entries(settings).filter(([key]) => key.startsWith('--')));

  return (
    <>
      {isSupported && <Filter baseFrequency={`${freq} ${freq}`} scale={scale} />}
      <motion.div
        style={{
          ...customProperties,
          x: smoothMouseX,
          y: smoothMouseY,
          scale: zoomLevel
        }}
        className={`${bubbleWrapperClasses} ${bubbleClasses} ${isSupported ? liquidGlassClasses : frostedGlassClasses}`}
        data-html2canvas-ignore="true"
      />
    </>
  );
};