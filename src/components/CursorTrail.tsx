// src/components/CursorTrail.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// --- Configuration & Types ---

type TrailCircle = {
  id: number;
  x: number;
  y: number;
  size: number;
  initialOpacity: number;
};

const SPACING = 4;

// A pool of random properties for the follower circles
const FOLLOWER_CONFIG = {
  minSize: 6 * SPACING,
  maxSize: 9 * SPACING,
  minOpacity: 0.25,
  maxOpacity: 1,
  spawnRadius: 12 * SPACING,
  fadeDuration: 2, // seconds
};

// --- Component ---

export function CursorTrail() {
  const [mounted, setMounted] = useState(false);
  const [trail, setTrail] = useState<TrailCircle[]>([]);
  const [isIdle, setIsIdle] = useState(true);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  // Core motion values for the cursor position
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Main circle is more responsive (less lag)
  const mainCircleSpring = { damping: 50, stiffness: 800, mass: 0.1 };
  const smoothMouseX = useSpring(mouseX, mainCircleSpring);
  const smoothMouseY = useSpring(mouseY, mainCircleSpring);

  const removeCircle = useCallback((id: number) => {
    setTrail((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // This function generates a random number skewed towards one end of the range.
  // 'strength' > 1 skews towards the max, < 1 skews towards the min.
  const randomSkewedNum = (strength: number, min: number, max: number) => {
    const rand = Math.pow(Math.random(), strength);
    return rand * (max - min) + min;
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    const point = "touches" in e ? e.touches[0] : e;
    if (!point) return;

    const { clientX, clientY } = point;

    // Update motion values for the main circle to follow
    mouseX.set(clientX);
    mouseY.set(clientY);

    // Reset idle timer on every move
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 200);

    // Calculate speed based on distance from the last known position
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Update the last position for the next event
    lastPos.current = { x: clientX, y: clientY };

    // --- Core Fix: Generate a circle based on speed, only on move ---
    // The faster the move, the more likely a circle is to spawn.
    // A speed threshold prevents circles from spawning on tiny jitters.
    if (speed > 5) {
      const { minSize, maxSize, minOpacity, maxOpacity, spawnRadius } = FOLLOWER_CONFIG;

      const size = Math.random() * (maxSize - minSize) + minSize;
      const initialOpacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;

      const angle = Math.random() * 2 * Math.PI;
      // Use the skewed random function to make circles more likely to spawn closer to the cursor
      const radius = randomSkewedNum(2, 0, spawnRadius); 
      const x = clientX + radius * Math.cos(angle) - size / 2;
      const y = clientY + radius * Math.sin(angle) - size / 2;
      
      const newCircle: TrailCircle = { id: Date.now() + Math.random(), x, y, size, initialOpacity };
      
      setTrail(prev => [...prev, newCircle]);
    }
  }, [mouseX, mouseY, trail.length, removeCircle]);

  useEffect(() => {
    setMounted(true);
    
    // Set initial position to avoid a flash from the corner on load
    const setInitialPosition = (e: MouseEvent) => {
        lastPos.current = { x: e.clientX, y: e.clientY };
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        window.removeEventListener("mousemove", setInitialPosition);
    }
    window.addEventListener("mousemove", setInitialPosition);
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [handleMouseMove, mouseX, mouseY]);

  if (!mounted) return null;

  const baseClasses = "fixed rounded-full pointer-events-none";
  const zIndexClass = "z-1";

  const circleSolid = true;
  const circleType = [['border-2 border-black', 'bg-black dark:bg-white'], ['bg-[#2f2f2b]', 'border-2 border-[#2f2f2b] dark:border-white']]

  return (
    <div id="cursorWrapper">
      {/* Main Circle */}
      <motion.div
        id="mainCursor"
        className={`w-9 h-9 ${baseClasses} -translate-x-1/2 -translate-y-1/2 ${zIndexClass} ${circleType[+circleSolid][0]} [#cursorWrapper:has(+_main_>_a:hover)_&]:mix-blend-difference [#cursorWrapper:has(+_main_>_a:hover)_&]:invert dark:invert`}
        style={{
          left: smoothMouseX,
          top: smoothMouseY,
        }}
        // The indefinite scale-in, scale-out idle animation
        animate={{ scale: isIdle ? [1, 1.1, 1] : 1 }}
        transition={{ scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }}
      />

      {/* Follower Circles */}
      {trail.map((circle) => (
        <motion.div
          key={circle.id}
          className={`${baseClasses} ${zIndexClass} ${circleType[+circleSolid][1]}`}
          style={{
            width: circle.size,
            height: circle.size,
            left: circle.x,
            top: circle.y,
          }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            scale: [0, 1, 0.75],
            opacity: [0, circle.initialOpacity, 0],
          }}
          transition={{
            duration: FOLLOWER_CONFIG.fadeDuration,
            ease: "easeOut",
            times: [0, 0.1, 0.75],
          }}
          // Removes itself from the state array once faded
          onAnimationComplete={() => removeCircle(circle.id)}
        />
      ))}
    </div>
  );
}