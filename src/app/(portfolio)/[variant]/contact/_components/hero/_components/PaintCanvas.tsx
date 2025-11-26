// src/app/(portfolio)/[variant]/contact/_components/PaintCanvas.tsx
"use client";

import { useRef, useEffect } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import clsx from 'clsx';

type PaintCanvasProps = {
    className?: string;
    brushSize: number;
    color: string;
};

// Linear Interpolation: Smoothing factor for the brush "physics"
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

export function PaintCanvas({ className, brushSize, color }: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { clientX, clientY } = useMousePosition();
  
  // Physics state: tracks the brush "tip" in LOCAL CANVAS coordinates
  const brushPos = useRef<{ x: number; y: number } | null>(null);
  const lastRenderPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      // Get exact container dimensions (handles min-height and layout changes)
      const rect = container.getBoundingClientRect();
      
      // Set canvas internal bitmap size to match display size 1:1
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const rawX = clientX.get();
      const rawY = clientY.get();

      // Wait for mouse init
      if (rawX === 0 && rawY === 0) {
        requestAnimationFrame(render);
        return;
      }

      // CRITICAL FIX: Convert Screen Coordinates (Viewport) to Local Coordinates (Canvas)
      // This accounts for scrolling offsets and container positioning.
      const rect = canvas.getBoundingClientRect();
      const targetX = rawX - rect.left;
      const targetY = rawY - rect.top;

      // Initialize on first interaction
      if (!brushPos.current) {
        brushPos.current = { x: targetX, y: targetY };
        lastRenderPos.current = { x: targetX, y: targetY };
      }

      // 1. Physics (Lerp) in Local Space
      const smoothness = 0.12;
      const newBrushX = lerp(brushPos.current.x, targetX, smoothness);
      const newBrushY = lerp(brushPos.current.y, targetY, smoothness);

      // 2. Geometry (Midpoints)
      const midPointX = (brushPos.current.x + newBrushX) / 2;
      const midPointY = (brushPos.current.y + newBrushY) / 2;

      const dist = Math.hypot(newBrushX - brushPos.current.x, newBrushY - brushPos.current.y);
      
      if (dist > 0.1 && lastRenderPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastRenderPos.current.x, lastRenderPos.current.y);
        
        // Curve through the old brush position to the new midpoint
        ctx.quadraticCurveTo(
          brushPos.current.x, 
          brushPos.current.y, 
          midPointX, 
          midPointY
        );
        
        ctx.stroke();

        lastRenderPos.current = { x: midPointX, y: midPointY };
        brushPos.current = { x: newBrushX, y: newBrushY };
      }

      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [brushSize, color, clientX, clientY]);

  return (
    
    <div ref={containerRef} className="absolute inset-0 z-1 pointer-events-none mix-blend-lighten dark:mix-blend-darken">
      <canvas 
        ref={canvasRef}
        className="size-full"
      />
    </div>
  );
}