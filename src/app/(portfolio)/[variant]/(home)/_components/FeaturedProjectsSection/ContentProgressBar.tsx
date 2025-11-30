import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import clsx from "clsx";

type ContentProgressBarProps = {
  projectNumber: number;
  progress: number;
  className: string;
};

export function ContentProgressBar({ projectNumber, progress, className }: ContentProgressBarProps) {
  const finalProgress = Math.max(Math.min(progress, 100), 0);
  const targetProgress = useMotionValue(finalProgress);

  // Sync React State -> Framer Motion
  useEffect(() => {
    targetProgress.set(finalProgress);
  }, [finalProgress, targetProgress]);

  const smoothProgress = useSpring(targetProgress, {
    stiffness: 500,
    damping: 50,
    restDelta: 0.001
  });

  const height = useTransform(smoothProgress, (val) => `${val}%`);

  return (
    <div className={clsx("px-4 md:px-8 flex flex-col text-center items-center gap-4 h-full", className)}>
      {/* Number Display */}
      <div className="text-[#7A751A] dark:text-[#EFEFD0] font-figtree text-4xl font-bold leading-none w-[2ch]">
        {projectNumber}
      </div>

      {/* Progress Track */}
      {/* Ensure the parent has height so 'grow' works. Added h-full to container above just in case */}
      <div className="relative grow rounded-full w-1 bg-[#E4E191] dark:bg-[#9a996b]">
        
        {/* Progress Thumb */}
        <motion.div
          className="relative rounded-[inherit] w-full bg-[#7A751A] dark:bg-[#EFEFD0]"
          // Apply the transformed MotionValue to the style prop
          style={{ height }}
        />
        
      </div>
    </div>
  );
}