"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useSpring, useTransform } from 'motion/react';
import { useMousePosition } from '@/hooks/useMousePosition';
import type { HeroProject } from '@/sanity/lib/queries';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// CONFIGURATION
const CANVAS_SCALE = 2;
const CARD_SIZE_REDUCTION_THRESHOLD = 12;
const CARD_SIZE_REDUCTION_RATE = 25;
const CARD_MIN_SIZE_REM = 8;
const MAX_PLACEMENT_ATTEMPTS = 10;
const JITTER_FACTOR = 1;

// Types & Helper Functions
type CardLayout = { left: string; top: string };
type Point = { x: number; y: number };

/**
 * **FINAL ALGORITHM**: "Collision-Aware Jittered Grid"
 * Guarantees full spread, random appearance, and no overlaps.
 */
const generateLayouts = (count: number, minDistance: number): CardLayout[] => {
    if (count === 0) return [];

    const placedPoints: Point[] = [];
    
    // 1. Determine grid dimensions. This ensures cards are spread out.
    const cols = Math.ceil(Math.sqrt(count * 1.25));
    const rows = Math.ceil(count / cols);
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    // **NEW**: 2. Separate cells into central and outer groups.
    const allCells = Array.from({ length: cols * rows }, (_, i) => i);
    const centralCells: number[] = [];
    const outerCells: number[] = [];

    const centerColStart = Math.floor(cols / 2) - Math.floor(Math.max(1, cols / 4) / 2);
    const centerColEnd = centerColStart + Math.max(1, Math.floor(cols / 4));
    const centerRowStart = Math.floor(rows / 2) - Math.floor(Math.max(1, rows / 4) / 2);
    const centerRowEnd = centerRowStart + Math.max(1, Math.floor(rows / 4));

    for (const cell of allCells) {
        const row = Math.floor(cell / cols);
        const col = cell % cols;
        if (col >= centerColStart && col < centerColEnd && row >= centerRowStart && row < centerRowEnd) {
            centralCells.push(cell);
        } else {
            outerCells.push(cell);
        }
    }
    
    // 3. Shuffle each group independently and then combine them, with central cells first.
    for (let i = centralCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [centralCells[i], centralCells[j]] = [centralCells[j], centralCells[i]];
    }
    for (let i = outerCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [outerCells[i], outerCells[j]] = [outerCells[j], outerCells[i]];
    }
    const prioritizedCells = [...centralCells, ...outerCells];

    // 4. Place each card using the prioritized cell list.
    for (let i = 0; i < count; i++) {
        const cell = prioritizedCells[i];
        if (cell === undefined) continue;

        const row = Math.floor(cell / cols);
        const col = cell % cols;

        const cellStartX = col * cellWidth;
        const cellStartY = row * cellHeight;
        
        let bestPoint: Point | null = null;
        
        // 5. Try multiple times to find a non-overlapping spot within the cell.
        for (let j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++) {
            const candidate: Point = {
                x: cellStartX + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * JITTER_FACTOR,
                y: cellStartY + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * JITTER_FACTOR,
            };

            let isOverlapping = false;
            for (const p of placedPoints) {
                const dx = p.x - candidate.x;
                const dy = p.y - candidate.y;
                if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
                    isOverlapping = true;
                    break;
                }
            }

            if (!isOverlapping) {
                bestPoint = candidate;
                break;
            }
        }
        
        // 6. If no non-overlapping spot is found, use the cell center as a fallback.
        if (!bestPoint) {
            bestPoint = { x: cellStartX + cellWidth / 2, y: cellStartY + cellHeight / 2 };
        }
        placedPoints.push(bestPoint);
    }

    return placedPoints.map(p => ({ left: `${p.x}%`, top: `${p.y}%` }));
};

// Main Component
type CanvasProps = {
    projects: HeroProject[];
    setActiveProject: (project: HeroProject | null) => void;
};

export function Canvas({ projects, setActiveProject }: CanvasProps) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const CARD_BASE_SIZE_REM = isMobile ? 10 : 20;

    // **NEW**: State to track if the component has mounted on the client
    const [hasMounted, setHasMounted] = useState(false);
    
    // **NEW**: State to hold the layout, generated only after mounting
    const [cardLayouts, setCardLayouts] = useState<CardLayout[]>([]);

    const dynamicCardSizeRem = useMemo(() => {
        if (projects.length <= CARD_SIZE_REDUCTION_THRESHOLD) return CARD_BASE_SIZE_REM;
        const reductionFactor = Math.min(1, (projects.length - CARD_SIZE_REDUCTION_THRESHOLD) / CARD_SIZE_REDUCTION_RATE);
        const newSize = CARD_BASE_SIZE_REM - (CARD_BASE_SIZE_REM - CARD_MIN_SIZE_REM) * reductionFactor;
        return Math.max(CARD_MIN_SIZE_REM, newSize);
    }, [projects.length, CARD_BASE_SIZE_REM]);

    const minDistance = useMemo(() => {
        const cardDiameterPx = dynamicCardSizeRem * 16;
        const canvasWidthPx = 1920 * CANVAS_SCALE;
        return (cardDiameterPx / canvasWidthPx) * 100 * 1.1; // 10% buffer
    }, [dynamicCardSizeRem]);

    // **MODIFIED**: This effect runs once on the client after the component mounts
    useEffect(() => {
        setCardLayouts(generateLayouts(projects.length, minDistance));
        setHasMounted(true);
    }, [projects.length, minDistance]);


    const { clientX, clientY } = useMousePosition();
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        handleResize();
        clientX.set(window.innerWidth / 2);
        clientY.set(window.innerHeight / 2);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [clientX, clientY]);

    const translateX = useTransform(clientX, [0, viewportSize.width], [-1, 1]);
    const translateY = useTransform(clientY, [0, viewportSize.height], [-1, 1]);

    const springConfig = { damping: 50, stiffness: 400, mass: 1 };
    const smoothX = useSpring(translateX, springConfig);
    const smoothY = useSpring(translateY, springConfig);
    
    const canvasX = useTransform(smoothX, (perc) => `calc(${perc} * ((var(--canvas-scale) - 1) / 2 * -100vw))`);
    const canvasY = useTransform(smoothY, (perc) => `calc(${perc} * ((var(--canvas-scale) - 1) / 2 * -100vh))`);

    const overhangX = `(var(--canvas-scale) - 1) / 2 * -100vw`;
    const overhangY = `(var(--canvas-scale) - 1) / 2 * -100vh`;

    return (
        <motion.div
            className="absolute -z-1"
            style={{
                '--canvas-scale': CANVAS_SCALE,
                inset: `calc(${overhangY}) calc(${overhangX})`,
                x: canvasX,
                y: canvasY,
            } as React.CSSProperties}
        >
            {/* **MODIFIED**: Only render children after mounting to prevent mismatch */}
            {hasMounted && projects.map((project, index) => {
                const layout = cardLayouts[index];
                if (!layout) return null;

                return (
                    <motion.div
                        key={project._id}
                        className="absolute group"
                        style={{
                            width: `${dynamicCardSizeRem}rem`,
                            height: `${dynamicCardSizeRem}rem`,
                            left: layout.left,
                            top: layout.top,
                            transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
                    >
                        <button
                            onClick={() => setActiveProject(project)}
                            className="w-full h-full block rounded-2xl md:rounded-4xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105"
                            aria-label={`View details for ${project.title}`}
                        >
                            <Image
                                src={project.thumbnail}
                                alt={`Thumbnail for ${project.title}`}
                                width={400}
                                height={400}
                                className="w-full h-full object-cover"
                                sizes={`${dynamicCardSizeRem}rem`}
                                priority={index < 5}
                            />
                        </button>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}