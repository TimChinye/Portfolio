"use client";

import { useState, useRef } from 'react';
import { BubbleCursor } from './BubbleCursor';
import { HeroHeading } from './HeroHeading';
import { InfoCard } from './InfoCard';
import { Canvas } from './Canvas';
import type { HeroProject } from '@/sanity/lib/queries';
import { AnimatePresence, cubicBezier, useScroll, useTransform } from 'motion/react';
import clsx from 'clsx';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Types & Config
type ClientProps = {
    variant: 'tim' | 'tiger';
    heroName: string;
    heroBio: string;
    projects: HeroProject[];
};

// Component
export function Client({ variant, heroName, heroBio, projects }: ClientProps) {
    const processIntroText = (text: string): React.ReactNode => {
        if (!text) return '';
        const parts = text.split('|');
        if (parts.length > 1) {
            return (
                <>
                    {parts[0]}
                    <br className="md:hidden" />
                    {parts[1]}
                </>
            );
        } else return text;
    };

    const processedIntro = processIntroText(heroBio);

    const headingClassName = variant === 'tim' ? 'text-[12rem] md:text-[20rem]' : 'text-[8rem] md:text-[12.5rem]';
    const introClassName = 'text-[5.806cqw] md:text-[3.082cqw]';

    const isMobile = useMediaQuery('(max-width: 768px)');
    const [activeProject, setActiveProject] = useState<HeroProject | null>(projects[0]);
    const [hoveredProject, setHoveredProject] = useState<HeroProject | null>(null);

    // Mobile Scroll Animation Logic
    const heroRef = useRef<HTMLDivElement>(null); 

    const { scrollYProgress: heroExitProgress } = useScroll({
        target: heroRef,
        offset: ["start end", "start 0.5"] 
    });
    
    const mobileInfoCardY = useTransform(
        heroExitProgress,
        [0, 1],
        ['0rem', '-6rem'],
        { ease: cubicBezier(0, 0, 0, 1) }
    );
    
    const infoCardStyle = isMobile ? { y: mobileInfoCardY } : {};

    return (
        <>
            <BubbleCursor hoveredProject={hoveredProject} />
            
            <HeroHeading
                headingText={heroName}
                introText={processedIntro}
                headingClassName={headingClassName}
                introClassName={introClassName}
            />

            <AnimatePresence mode='wait'>
                {activeProject && (
                    <InfoCard
                        key={activeProject._id} 
                        project={activeProject}
                        onClose={() => setActiveProject(null)}
                        className={clsx(
                            "absolute w-[calc(100%-2rem)]",
                            "max-md:m-4 max-md:left-0 max-md:bottom-24",
                            "md:w-2xl md:top-8 md:right-0",
                        )}
                        style={infoCardStyle}
                    />
                )}
            </AnimatePresence>
            
            <Canvas
              projects={projects} 
              setActiveProject={setActiveProject}
              setHoveredProject={setHoveredProject}
            />

            <div ref={heroRef} className="absolute inset-0 top-full -mt-24 -z-999 pointer-events-none" />
        </>
    );
}