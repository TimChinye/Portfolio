// src/app/(portfolio)/[variant]/_components/FeaturedProjectsSection/Client.tsx
"client";

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, useMotionValue, MotionValue } from 'motion/react';
import { useSectionScrollProgress } from '@/components/ui/Section';
import type { FeaturedProject } from '@/sanity/lib/queries';

import { FeaturedProjectContent } from './FeaturedProjectContent';
import { ContentProgressBar } from './ContentProgressBar';
import { VerticalTrack } from './VerticalTrack';

// --- CONFIGURATION ---
const SCROLL_DISTANCE_MULTIPLIER = 5;
const TRANSITION_GAP_MULTIPLIER = 25;
const FADE_OUT_DURATION = 0.5;
const FADE_IN_START = 0.5;
// --- END CONFIGURATION ---

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

  return (
    <motion.div style={{ opacity: finalOpacity }} className="flex absolute inset-0">
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

  // --- FIX: REMOVED the useEffect that was causing the race condition ---
  // The useLayoutEffect below now handles all initialization.

  const masterScrollYProgress = useSectionScrollProgress();

  useLayoutEffect(() => {
    // ... measurement logic (unchanged) ...
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

  // --- REFACTORED UPDATE LOGIC ---
  const updateVisualsFromScroll = useCallback((progress: number) => {
    const totalDuration = scrollMapRef.current[scrollMapRef.current.length - 1]?.end ?? 0;
    if (totalDuration === 0) return;

    const virtualScrollY = progress * totalDuration;
    let activeFound = false;

    // 1. Start by setting all opacities to 0. This creates a clean slate.
    projectMotionValues.forEach(mvs => mvs.opacity.set(0));

    // 2. Find the active item(s) and set their properties.
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
        break; // Exit the loop once we've found the active segment
      }
    }
    
    // Handle edge case where scroll is exactly at 0
    if (!activeFound && progress === 0) {
        projectMotionValues[0].opacity.set(1);
        projectMotionValues[0].localProgress.set(0);
    }

  }, [projects, projectMotionValues]);

  // This effect listens for CHANGES during active scrolling.
  useEffect(() => {
    const unsubscribe = masterScrollYProgress.on("change", updateVisualsFromScroll);
    return () => unsubscribe();
  }, [masterScrollYProgress, updateVisualsFromScroll]);

  // This effect SYNCHRONIZES the state on initial render and re-renders.
  useLayoutEffect(() => {
    updateVisualsFromScroll(masterScrollYProgress.get());
  }, [masterScrollYProgress, updateVisualsFromScroll, isInitialMeasurement]); // Re-sync after measurement

  // --- END OF REFACTORED LOGIC ---

  return (
    <div ref={containerRef} className="size-full">
      <div style={{ opacity: 0, pointerEvents: 'none', visibility: isInitialMeasurement ? 'visible' : 'hidden' }} className="absolute inset-0 size-full py-24 px-8 md:py-32 md:px-16 flex gap-4 md:gap-8">
        <div className="flex-1 flex flex-col gap-8 text-[5vw] font-bold leading-none">
          {projects.map((project, projectIndex) => (
            <div key={project._id}>
              <h1 className="text-[#948D00FF] text-[1.5em] leading-[inherit] m-0">{project.title.split(' ').map((word, i) => <span key={i} data-project-index={projectIndex} data-word-index className="inline-block">{word}&nbsp;</span>)}</h1>
              <p className="text-[#3D3B0D80] leading-[inherit] m-0">{project.featuredDescription.split(/\s+/).map((word, i) => <span key={i} data-project-index={projectIndex} data-word-index className="inline-block">{word}&nbsp;</span>)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="size-full py-24 px-8 md:py-32 md:px-16 flex gap-4 md:gap-8">
        <ContentProgressBar projectNumber={currentProjectIndex + 1} progress={contentProgress} />
        <div className="flex-1 relative">
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
        </div>
        <VerticalTrack projectSlug={activeProjectSlug} />
      </div>
    </div>
  );
}