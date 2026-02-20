"use client";

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, useMotionValue, MotionValue, useTransform } from 'motion/react';
import { useSectionScrollProgress } from '@/components/ui/Section';
import type { FeaturedProject } from '@/sanity/lib/queries';

import { FeaturedProjectContent } from './FeaturedProjectContent';
import { ContentProgressBar } from './ContentProgressBar';
import { VerticalTrack } from './VerticalTrack';
import { SectionTitle } from './SectionTitle';
import { CustomLink as Link } from '@/components/ui/CustomLink';

const SCROLL_DISTANCE_MULTIPLIER = 2;
const TRANSITION_GAP_MULTIPLIER = 15;
const FADE_OUT_DURATION = 0.5;
const FADE_IN_START = 0.5;

type ScrollMapItem = {
  type: 'project' | 'gap';
  start: number;
  end: number;
  height: number;
  projectIndex?: number;
};

type ProjectDisplayProps = {
  project: FeaturedProject;
  localProgressMV: MotionValue<number>;
  opacityMV: MotionValue<number>;
  isLastProject: boolean;
  setContentProgress: (progress: number) => void;
};

function ProjectDisplay({ project, localProgressMV, opacityMV, isLastProject, setContentProgress }: ProjectDisplayProps) {
  const finalOpacity = useMotionValue(opacityMV.get());
  
  useEffect(() => {
    const updateFinalOpacity = () => {
      const isComplete = isLastProject && localProgressMV.get() >= 1;
      finalOpacity.set(isComplete ? 1 : opacityMV.get());
    };
    
    const unsubOpacity = opacityMV.on("change", updateFinalOpacity);
    const unsubProgress = localProgressMV.on("change", updateFinalOpacity);
    
    return () => {
      unsubOpacity();
      unsubProgress();
    };
  }, [opacityMV, localProgressMV, finalOpacity, isLastProject]);

  const pointerEvents = useTransform(finalOpacity, (opacity) => opacity > 0 ? 'auto' : 'none');

  return (
    <motion.div style={{ opacity: finalOpacity, pointerEvents }} className="flex absolute inset-0">
      <FeaturedProjectContent
        activeProject={project}
        scrollYProgress={localProgressMV}
        setContentProgress={setContentProgress}
      />
    </motion.div>
  );
}

type ClientProps = {
  projects: FeaturedProject[];
  onDurationCalculated: (durationInPixels: number) => void;
};

export function Client({ projects, onDurationCalculated }: ClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollMapRef = useRef<ScrollMapItem[]>([]);
  const [isInitialMeasurement, setIsInitialMeasurement] = useState(true);

  const [contentProgress, setContentProgress] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeProjectSlug, setActiveProjectSlug] = useState(projects[0]?.slug.current ?? '');

  const projectMotionValues = useRef(projects.map(() => ({
    localProgress: useMotionValue(0),
    opacity: useMotionValue(0),
  }))).current;

  const masterScrollYProgress = useSectionScrollProgress();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const wordSpans = Array.from(container.querySelectorAll<HTMLSpanElement>('[data-word-index]'));
    if (wordSpans.length === 0) return;
    
    const containerTop = container.getBoundingClientRect().top;
    let avgLineHeight = 0, totalLines = 0;
    const projectsMetrics = projects.map(() => ({ lines: [] as { offsetTop: number, offsetHeight: number }[] }));
    
    wordSpans.forEach(span => {
      const projectIndex = parseInt(span.dataset.projectIndex!, 10);
      const metrics = projectsMetrics[projectIndex];
      if (metrics) {
        const wordRect = span.getBoundingClientRect();
        const relativeTop = wordRect.top - containerTop;
        if (metrics.lines.length === 0 || Math.abs(relativeTop - metrics.lines[metrics.lines.length - 1].offsetTop) > 1) {
          metrics.lines.push({ offsetTop: relativeTop, offsetHeight: wordRect.height });
          avgLineHeight += wordRect.height;
          totalLines++;
        }
      }
    });
    
    if (totalLines > 0) avgLineHeight /= totalLines;
    
    let currentPos = 0;
    const newScrollMap: ScrollMapItem[] = [];
    
    projectsMetrics.forEach((metrics, index) => {
      const projectHeight = metrics.lines.length * avgLineHeight * SCROLL_DISTANCE_MULTIPLIER;
      newScrollMap.push({ type: 'project', start: currentPos, end: currentPos + projectHeight, height: projectHeight, projectIndex: index });
      currentPos += projectHeight;
      if (index < projects.length - 1) {
        const gapHeight = avgLineHeight * TRANSITION_GAP_MULTIPLIER;
        newScrollMap.push({ type: 'gap', start: currentPos, end: currentPos + gapHeight, height: gapHeight });
        currentPos += gapHeight;
      }
    });
    
    scrollMapRef.current = newScrollMap;
    onDurationCalculated(currentPos);
    if (isInitialMeasurement) setIsInitialMeasurement(false);
  }, [projects, onDurationCalculated, isInitialMeasurement]);

  useEffect(() => {
    const handleResize = () => setIsInitialMeasurement(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateVisualsFromScroll = useCallback((progress: number) => {
    const totalDuration = scrollMapRef.current[scrollMapRef.current.length - 1]?.end ?? 0;
    if (totalDuration === 0) return;

    const virtualScrollY = progress * totalDuration;
    let activeFound = false;

    // Reset opacities to clean slate
    projectMotionValues.forEach(mvs => mvs.opacity.set(0));

    // Determine active items/gaps and interpolate local progress
    for (const item of scrollMapRef.current) {
      if (virtualScrollY >= item.start && virtualScrollY <= item.end) {
        activeFound = true;
        if (item.type === 'project') {
          const mvs = projectMotionValues[item.projectIndex!];
          mvs.localProgress.set((virtualScrollY - item.start) / item.height);
          mvs.opacity.set(1);
          setCurrentProjectIndex(item.projectIndex!);
          setActiveProjectSlug(projects[item.projectIndex!]?.slug.current ?? '');
        } else if (item.type === 'gap') {
          const prevItem = scrollMapRef.current[scrollMapRef.current.indexOf(item) - 1];
          const nextItem = scrollMapRef.current[scrollMapRef.current.indexOf(item) + 1];
          const prevMVs = projectMotionValues[prevItem.projectIndex!];
          const nextMVs = projectMotionValues[nextItem.projectIndex!];
          
          const progressInGap = (virtualScrollY - item.start) / item.height;
          const outgoingOpacity = 1 - Math.max(0, Math.min(1, progressInGap / FADE_OUT_DURATION));
          const incomingOpacity = Math.max(0, Math.min(1, (progressInGap - FADE_IN_START) / (1 - FADE_IN_START)));

          prevMVs.opacity.set(outgoingOpacity);
          nextMVs.opacity.set(incomingOpacity);
          
          // Set progress for the transitioning elements so they don't jump
          prevMVs.localProgress.set(1);
          nextMVs.localProgress.set(0);
          setCurrentProjectIndex(prevItem.projectIndex!);
          setActiveProjectSlug(projects[prevItem.projectIndex!]?.slug.current ?? '');
        }
        break;
      }
    }
    
    // Handle edge case where scroll is less than 1
    if (!activeFound && progress < 1) {
        projectMotionValues[0].opacity.set(1);
        projectMotionValues[0].localProgress.set(0);
    }

  }, [projects, projectMotionValues]);

  useEffect(() => {
    const unsubscribe = masterScrollYProgress.on("change", updateVisualsFromScroll);
    return () => unsubscribe();
  }, [masterScrollYProgress, updateVisualsFromScroll]);

  useLayoutEffect(() => {
    updateVisualsFromScroll(masterScrollYProgress.get());
  }, [masterScrollYProgress, updateVisualsFromScroll, isInitialMeasurement]); 

  const buttonOpacity = useTransform(masterScrollYProgress, [0.9, 1], [0, 1]);
  const buttonY = useTransform(masterScrollYProgress, [0.9, 1], ['2rem', '0rem']);
  const buttonPointerEvents = useTransform(masterScrollYProgress, (v) => v >= 0.95 ? 'auto' : 'none');

  return (
    <div ref={containerRef} className="size-full relative">
        <SectionTitle containerRef={containerRef} stickyProgress={masterScrollYProgress} />

        <div className="size-full px-8 md:px-16 h-full flex flex-col">
            <div className="flex gap-4 md:gap-16 flex-1 min-h-0">
                <ContentProgressBar
                  projectNumber={currentProjectIndex + 1}
                  progress={contentProgress}
                  className="pt-56 pb-40 md:pt-64 md:pb-48"
                />
                
                <div className="flex-1 relative">
                    {/* Measurement Layer */}
                    <div style={{ opacity: 0, pointerEvents: 'none', visibility: isInitialMeasurement ? 'visible' : 'hidden' }} className="absolute inset-0 flex">
                        <div className="flex-1 flex flex-col gap-8 text-[5vw] font-bold leading-none">
                            {projects.map((project, projectIndex) => (
                            <div key={project._id}>
                                <h1 className="text-[#948D00FF] dark:text-[#948D00FF] text-[1.5em] leading-[inherit] m-0">{project.title.split(' ').map((word, i) => <span key={i} data-project-index={projectIndex} data-word-index className="inline-block">{word}&nbsp;</span>)}</h1>
                                <p className="text-[#3D3B0D80] dark:text-[#3D3B0D80] leading-[inherit] m-0">
                                  {project.featuredDescription.split('\n').map((line, lineIdx) => (
                                    <span key={lineIdx} className="block">
                                      {line.split(/\s+/).map((word, i) => word ? (
                                        <span key={i} data-project-index={projectIndex} data-word-index className="inline-block">{word}&nbsp;</span>
                                      ) : null)}
                                    </span>
                                  ))}
                                </p>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Displays */}
                    {projects.map((project, index) => (
                    <ProjectDisplay
                        key={project._id}
                        project={project}
                        localProgressMV={projectMotionValues[index].localProgress}
                        opacityMV={projectMotionValues[index].opacity}
                        isLastProject={index === projects.length - 1}
                        setContentProgress={setContentProgress}
                    />
                    ))}

                    {/* VIEW ALL PROJECTS BUTTON */}
                    <motion.div
                        style={{ opacity: buttonOpacity, y: buttonY, pointerEvents: buttonPointerEvents }}
                        className="absolute bottom-0 left-0"
                    >
                        <Link 
                        href="/projects" 
                        className="group flex items-center gap-2 text-[clamp(1rem,1.5vw,1.25rem)] font-figtree font-bold uppercase tracking-wide text-[#7A751A] hover:text-[#948D00] dark:text-[#EFEFD0] dark:hover:text-[#9a996b] hover:opacity-100 transition-[color,opacity]"
                        >
                        <span>View All Projects</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    </motion.div>
                </div>

                <VerticalTrack
                  className="py-24 md:py-32"
                  projectSlug={activeProjectSlug}
                />
            </div>
        </div>
    </div>
  );
}