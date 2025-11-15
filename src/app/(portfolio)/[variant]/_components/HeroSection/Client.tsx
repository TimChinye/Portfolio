"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react';
import { BubbleCursor } from './BubbleCursor';
import { HeroHeading } from './HeroHeading';
import { InfoCard } from './InfoCard';
import type { HeroProject } from '@/sanity/lib/queries';

// --- Types & Config ---
type ClientProps = {
    variant: 'tim' | 'tiger';
    heroName: string;
    heroBio: string;
    projects: HeroProject[];
};

// --- Component ---
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
        }
        return text;
    };

    const processedIntro = processIntroText(heroBio);

    const headingClassName = variant === 'tim' ? 'text-[16rem] md:text-[24rem]' : 'text-[8rem] md:text-[16rem]';
    const introClassName = 'text-[5.806cqw] md:text-[3.083cqw]';

    return (
        <>
            <BubbleCursor />
            
            <HeroHeading
                headingText={heroName}
                introText={processedIntro}
                headingClassName={headingClassName}
                introClassName={introClassName}
            />
        </>
    );
}

// type CardLayout = {
//     width: string;
//     left: string;
//     top: string;
// };

// // Predefined layout positions inspired by clou.ch
// const cardLayouts: CardLayout[] = [
//     { width: '20vw', left: '5%', top: '12%' },
//     { width: '18vw', left: '8%', top: '75%' },
//     { width: '22vw', left: '28%', top: '2%' },
//     { width: '25vw', left: '25%', top: '60%' },
//     { width: '20vw', left: '48%', top: '35%' },
//     { width: '24vw', left: '70%', top: '8%' },
//     { width: '19vw', left: '75%', top: '80%' },
//     { width: '21vw', left: '92%', top: '25%' },
//     { width: '23vw', left: '88%', top: '55%' },
//     { width: '15vw', left: '18%', top: '40%' },
//     { width: '17vw', left: '60%', top: '90%' },
//     { width: '16vw', left: '80%', top: '30%' },
// ];

// const shuffleArray = <T,>(array: T[]): T[] => {
//     const newArray = [...array];
//     for (let i = newArray.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
//     }
//     return newArray;
// };

// -----------------------------------

// const [activeProject, setActiveProject] = useState<HeroProject | null>(null);
// const [shuffledProjects, setShuffledProjects] = useState<HeroProject[]>([]);

// // Shuffle projects once on mount for a random-yet-stable layout
// useEffect(() => {
//     setShuffledProjects(shuffleArray(projects));
// }, [projects]);

// // Mouse parallax effect logic
// const springConfig = { damping: 40, stiffness: 200, mass: 1 };
// const parallaxX = useMotionValue(0);
// const parallaxY = useMotionValue(0);
// const smoothParallaxX = useSpring(parallaxX, springConfig);
// const smoothParallaxY = useSpring(parallaxY, springConfig);

// const handleMouseMove = useCallback((e: MouseEvent) => {
//     const { clientX, clientY } = e;
//     const { innerWidth, innerHeight } = window;

//     const mouseXFromCenter = clientX / innerWidth - 0.5;
//     const mouseYFromCenter = clientY / innerHeight - 0.5;

//     const movementFactor = 60;

//     parallaxX.set(mouseXFromCenter * -movementFactor);
//     parallaxY.set(mouseYFromCenter * -movementFactor);
// }, [parallaxX, parallaxY]);

// useEffect(() => {
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
// }, [handleMouseMove]);

// --------------

// {/* Central Text */}
// <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
//     <h1 className="text-[clamp(4rem,25vmin,24rem)] font-black uppercase leading-none text-center text-black/80 dark:text-white/80">
//         {heroName}
//     </h1>
//     <p className="max-w-md text-center text-sm md:text-base text-black/60 dark:text-white/60">
//         {heroBio}
//     </p>
// </div>

// {/* Project Cards Canvas */}
// <motion.div
//     className="absolute w-[150vw] h-[150vh] -translate-x-[16.66%] -translate-y-[16.66%]"
//     style={{
//         x: smoothParallaxX,
//         y: smoothParallaxY,
//     }}
// >
//     {shuffledProjects.map((project, index) => {
//         const layout = cardLayouts[index % cardLayouts.length];
//         if (!layout) return null;

//         return (
//             <motion.div
//                 key={project._id}
//                 className="absolute group z-10"
//                 style={{
//                     width: layout.width,
//                     left: layout.left,
//                     top: layout.top,
//                 }}
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
//             >
//                 <button
//                     onClick={() => setActiveProject(project)}
//                     className="w-full h-full block rounded-xl md:rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105"
//                     aria-label={`View details for ${project.title}`}
//                 >
//                     <Image
//                         src={project.imageUrl}
//                         alt={`Thumbnail for ${project.title}`}
//                         width={400}
//                         height={400}
//                         className="w-full h-full object-cover"
//                         priority={index < 5}
//                     />
//                 </button>
//             </motion.div>
//         );
//     })}
// </motion.div>

// {/* Info Card */}
// <AnimatePresence>
//     {activeProject && (
//         <InfoCard project={activeProject} onClose={() => setActiveProject(null)} />
//     )}
// </AnimatePresence>