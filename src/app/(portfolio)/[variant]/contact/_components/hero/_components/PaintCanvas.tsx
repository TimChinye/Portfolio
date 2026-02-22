"use client";

import { useRef, useEffect } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

type PaintCanvasProps = {
    className?: string;
    brushSize: number;
    color: string;
};

// Good old lerp
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

export function PaintCanvas({ brushSize, color }: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { clientX, clientY } = useMousePosition();
  
  const brushPos = useRef<{ x: number; y: number } | null>(null);
  const lastRenderPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      
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

      // Wait for mouse to appear on screen
      if (rawX === 0 && rawY === 0) {
        requestAnimationFrame(render);
        return;
      }

      // Accounts for scrolling offsets.
      const rect = canvas.getBoundingClientRect();
      const targetX = rawX - rect.left;
      const targetY = rawY - rect.top;

      // Init
      if (!brushPos.current) {
        brushPos.current = { x: targetX, y: targetY };
        lastRenderPos.current = { x: targetX, y: targetY };
      }

      const smoothness = 0.125;
      const newBrushX = lerp(brushPos.current.x, targetX, smoothness);
      const newBrushY = lerp(brushPos.current.y, targetY, smoothness);

      const midPointX = (brushPos.current.x + newBrushX) / 2;
      const midPointY = (brushPos.current.y + newBrushY) / 2;

      const dist = Math.hypot(newBrushX - brushPos.current.x, newBrushY - brushPos.current.y);
      
      if (dist > 0.1 && lastRenderPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastRenderPos.current.x, lastRenderPos.current.y);
        
        // Always curve from the last position, to always make the lines smooth.
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
    
    <div
      ref={containerRef}
      className="absolute inset-0 z-1 pointer-events-none mix-blend-lighten dark:mix-blend-darken"
    >
      <canvas 
        ref={canvasRef}
        className="size-full"
      />
    </div>
  );
}