"use client";

import { useRef, useEffect, RefObject } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

type PaintCanvasProps = {
    className?: string;
    brushSize: number;
    color: string;
    textRef?: RefObject<HTMLHeadingElement | null>;
    onTouchPosition?: (x: number, y: number, inText: boolean) => void;
};

// Good old lerp
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

export function PaintCanvas({ brushSize, color, textRef, onTouchPosition }: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { clientX, clientY } = useMousePosition();
  
  const brushPos = useRef<{ x: number; y: number } | null>(null);
  const lastRenderPos = useRef<{ x: number; y: number } | null>(null);
  const touchPos = useRef<{ x: number; y: number } | null>(null);
  const canDraw = useRef(false);
  const isTouchActive = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      
      // Set canvas size in device pixels for sharp rendering
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale context so drawing operations use CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      let rawX: number, rawY: number;
      
      // Use touch position if available (last tap), otherwise use mouse position
      if (touchPos.current) {
        rawX = touchPos.current.x;
        rawY = touchPos.current.y;
      } else {
        rawX = clientX.get();
        rawY = clientY.get();
      }
      
      // Wait for input to appear on screen
      if (rawX === 0 && rawY === 0) {
        requestAnimationFrame(render);
        return;
      }

      // Accounts for scrolling offsets. Coordinates in CSS pixels (context is scaled by dpr).
      const rect = canvas.getBoundingClientRect();
      const targetX = rawX - rect.left;
      const targetY = rawY - rect.top;

      // Init brush position on first valid input
      if (!brushPos.current) {
        brushPos.current = { x: targetX, y: targetY };
        lastRenderPos.current = { x: targetX, y: targetY };
        requestAnimationFrame(render);
        return;
      }

      const smoothness = isTouchActive.current ? 0.3 : 0.125; // Less smoothing for touch
      const newBrushX = lerp(brushPos.current.x, targetX, smoothness);
      const newBrushY = lerp(brushPos.current.y, targetY, smoothness);

      const midPointX = (brushPos.current.x + newBrushX) / 2;
      const midPointY = (brushPos.current.y + newBrushY) / 2;

      const dist = Math.hypot(newBrushX - brushPos.current.x, newBrushY - brushPos.current.y);
      
      // Draw line when there's movement
      if (dist > 0.5 && lastRenderPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastRenderPos.current.x, lastRenderPos.current.y);
        
        ctx.quadraticCurveTo(
          brushPos.current.x, 
          brushPos.current.y, 
          midPointX, 
          midPointY
        );
        
        ctx.stroke();

        lastRenderPos.current = { x: midPointX, y: midPointY };
      }
      
      // Always update brush position to track movement
      brushPos.current = { x: newBrushX, y: newBrushY };

      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [brushSize, color, clientX, clientY]);

  // Touch event handlers for mobile drawing
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Check if touch started inside text bounds using Range for precise text metrics
    let hitText = false;
    if (textRef?.current) {
      const textElement = textRef.current;
      const range = document.createRange();
      const textNodes = Array.from(textElement.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
      
      // Collect all individual line rectangles
      const lineRects: DOMRect[] = [];
      
      textNodes.forEach((node) => {
        range.selectNodeContents(node);
        const rects = range.getClientRects();
        for (let i = 0; i < rects.length; i++) {
          lineRects.push(rects[i]);
        }
      });
      
      // Check if touch is inside ANY text line rect (not combined bounding box)
      hitText = lineRects.some((rect) => {
        return touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom;
      });
      
      if (hitText) {
        canDraw.current = true;
        onTouchPosition?.(touch.clientX, touch.clientY, true);
      } else {
        canDraw.current = false;
        onTouchPosition?.(touch.clientX, touch.clientY, false);
        return; // Don't prevent default, allow scrolling
      }
    } else {
      canDraw.current = false;
      onTouchPosition?.(touch.clientX, touch.clientY, false);
      return;
    }
    
    if (e.cancelable) e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      touchPos.current = { x: touch.clientX, y: touch.clientY };
      isTouchActive.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canDraw.current) {
      return;
    }
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    touchPos.current = { x: touch.clientX, y: touch.clientY };
    // Report position to parent for cursor tracking (only during drawing inside text)
    onTouchPosition?.(touch.clientX, touch.clientY, true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!canDraw.current) {
      onTouchPosition?.(0, 0, false);
      return;
    }
    if (e.cancelable) e.preventDefault();
    
    canDraw.current = false;
    isTouchActive.current = false;
    
    // Signal that we've left the text area
    onTouchPosition?.(0, 0, false);
  };

  return (
    
    <div
      ref={containerRef}
      className="absolute inset-0 z-1 mix-blend-lighten dark:mix-blend-darken"
    >
      <canvas 
        ref={canvasRef}
        className="size-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      />
    </div>
  );
}