"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useSpring, useTransform } from 'motion/react';
import { useMousePosition } from '@/hooks/useMousePosition';
import type { HeroProject } from '@/sanity/lib/queries';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const CANVAS_SCALE = 2.5; // The canvas is 2x the viewport size

// 1. CARD SIZE (Controls the gap between cards)
// < 1.0 = Smaller cards (MORE SPACE between them)
// > 1.0 = Larger cards (LESS SPACE / more overlap)
const CARD_SIZE_FACTOR = 1.25;

// 2. RANDOMNESS (Controls how messy the grid is)
// 0.0 = Perfectly rigid grid
// 1.0 = Standard randomness
const JITTER_STRENGTH = 1.0;

// 3. SHAPE (Controls the overall shape of the cloud)
// 1.0 = Square
// 1.66 = Standard Landscape (16:10)
// 2.5 = Wide Panoramic
const GRID_ASPECT_RATIO = 1.66;

// The "Magic 15" Pattern
const PATTERN = [
    { x: -0.06, y: -0.09 },  // Top-Left bias
    { x: 0.15, y: 0.15 },    // Bottom-Right bias
    { x: 0.0, y: -0.22 },    // Top Center
    { x: -0.12, y: 0.09 },   // Left Center
    { x: 0.22, y: -0.09 },   // Right Center
    { x: 0.09, y: 0.22 },    // Bottom Center
    { x: -0.09, y: 0.15 },   // Bottom-Left
    { x: 0.15, y: -0.15 },   // Top-Right
    { x: 0.0, y: 0.0 },      // Dead Center (Hero)
    { x: -0.15, y: -0.25 },  // Extreme Top-Left
    { x: 0.25, y: 0.25 },    // Extreme Bottom-Right
    { x: -0.03, y: 0.25 },   // Bottom Center
    { x: 0.25, y: -0.06 },   // Right Center
    { x: 0, y: -0.03 },      // Left
    { x: 0.03, y: -0.18 },   // Top
];

// width: 17.5742rem; height: 17.5742rem; left: 58%; top: 80%; opacity: 1; transform: translateX(-50%) translateY(-50%);

// Types
type CardLayout = { left: string; top: string };

/**
 * Generates a layout that looks random but maintains a structured distribution.
 */
const generateLayouts = (count: number): CardLayout[] => {
    if (count === 0) return [];

    // 1. Determine Grid Dimensions using Configured Aspect Ratio
    const cols = Math.ceil(Math.sqrt(count * GRID_ASPECT_RATIO));
    const rows = Math.ceil(count / cols);

    const layouts: CardLayout[] = [];

    for (let i = 0; i < count; i++) {
        const rowIndex = Math.floor(i / cols);
        const colIndex = i % cols;

        // 2. Logic to Center the Last Row
        const isLastRow = rowIndex === rows - 1;
        const itemsInLastRow = count % cols === 0 ? cols : count % cols;
        const centeringOffset = isLastRow ? (cols - itemsInLastRow) / 2 : 0;

        // 3. Get Pattern Modifiers
        const pattern = PATTERN[i % PATTERN.length];

        // 4. Calculate Normalized Coordinates
        // We apply the JITTER_STRENGTH here to control randomness
        const xNorm = (colIndex + centeringOffset + 0.5 + (pattern.x * JITTER_STRENGTH)) / cols;
        const yNorm = (rowIndex + 0.5 + (pattern.y * JITTER_STRENGTH)) / rows;

        // 5. Convert to Percentage
        const left = `${Math.max(2, Math.min(98, xNorm * 100))}%`;
        const top = `${Math.max(2, Math.min(98, yNorm * 100))}%`;

        layouts.push({ left, top });
    }

    return layouts;
};

type CanvasProps = {
    projects: HeroProject[];
    setActiveProject: (project: HeroProject | null) => void;
    setHoveredProject: (project: HeroProject | null) => void;
};

export function Canvas({ projects, setActiveProject, setHoveredProject }: CanvasProps) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // Base sizing constants
    const BASE_SIZE_REM = isMobile ? 24 : 32;
    const MIN_SIZE_REM = isMobile ? 6 : 8;
    
    const [hasMounted, setHasMounted] = useState(false);
    const [cardLayouts, setCardLayouts] = useState<CardLayout[]>([]);

    // **Dynamic Sizing Logic**
    const baseCardSizeRem = useMemo(() => {
        const count = projects.length;
        if (count <= 0) return BASE_SIZE_REM;
        
        const densityFactor = Math.sqrt(count);
        const calculatedSize = ((BASE_SIZE_REM * 3.5) / (densityFactor + 2.5)) * CARD_SIZE_FACTOR;
        
        return Math.max(MIN_SIZE_REM, Math.min(BASE_SIZE_REM, calculatedSize));
    }, [projects.length, BASE_SIZE_REM, MIN_SIZE_REM]);

    // Generate layouts when projects change
    useEffect(() => {
        setCardLayouts(generateLayouts(projects.length));
        setHasMounted(true);
    }, [projects.length]);

    // Mouse Movement Logic
    const { clientX, clientY } = useMousePosition();
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        handleResize();
        
        // Initialize center pos
        if (typeof window !== 'undefined') {
            clientX.set(window.innerWidth / 2);
            clientY.set(window.innerHeight / 2);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [clientX, clientY]);

    const translateX = useTransform(clientX, [0, viewportSize.width], [-1, 1]);
    const translateY = useTransform(clientY, [0, viewportSize.height], [-1, 1]);

    const springConfig = { damping: 50, stiffness: 400, mass: 1 };
    const smoothX = useSpring(translateX, springConfig);
    const smoothY = useSpring(translateY, springConfig);
    
    // Parallax Math
    const overhangX = `(var(--canvas-scale) - 1) / 2 * -100vw`;
    const overhangY = `(var(--canvas-scale) - 1) / 2 * -100vh`;
    const canvasX = useTransform(smoothX, (perc) => `calc(${perc} * ${overhangX})`);
    const canvasY = useTransform(smoothY, (perc) => `calc(${perc} * ${overhangY})`);

    return (
        <motion.div
            className="absolute pointer-events-none dark:brightness-95"
            style={{
                '--canvas-scale': CANVAS_SCALE,
                inset: `calc(${overhangY}) calc(${overhangX})`,
                x: canvasX,
                y: canvasY,
            } as React.CSSProperties}
        >
            {hasMounted && projects.map((project, index) => {
                const layout = cardLayouts[index];
                if (!layout) return null;

                const { left, top } = layout;

                return (
                    <motion.div
                        key={project._id}
                        className="absolute pointer-events-auto"
                        style={{
                            width: `${baseCardSizeRem}rem`,
                            height: `${baseCardSizeRem}rem`,
                            left,
                            top,
                            translate: '-50% -50%'
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 0.5, 
                            delay: Math.min(1.5, index * 0.05),
                            ease: [0.22, 1, 0.36, 1] 
                        }}
                    >
                        <button
                            onClick={() => setActiveProject(project)}
                            onMouseEnter={() => setHoveredProject(project)}
                            onMouseLeave={() => setHoveredProject(null)}
                            className="size-full cursor-pointer block rounded-2xl md:rounded-4xl p-4 overflow-hidden shadow-lg transition-transform duration-500 bg-[#F5F5EF] dark:bg-[#1A1A17]"
                            aria-label={`View details for ${project.title}`}
                        >
                            <Image
                                src={project.thumbnailUrl}
                                alt={`Thumbnail for ${project.title}`}
                                width={400}
                                height={400}
                                className="size-full object-cover rounded-[inherit]"
                                sizes={`${Math.ceil(baseCardSizeRem)}rem`}
                                priority={index < 8}
                            />
                        </button>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}