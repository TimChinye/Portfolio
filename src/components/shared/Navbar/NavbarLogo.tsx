"use client";

// import Image from "next/image";
// import { motion, AnimatePresence, useTransform, type MotionValue } from "motion/react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { WipeDirection } from "@/components/features/ThemeSwitcher/types";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";

/*
const TimHoverEffect = () => (
  <AnimatePresence>
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ duration: 0.5, ease: 'circOut' }}
    >
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 border-[3px] border-black" />
      <motion.div
        className="absolute inset-0"
        initial={{ y: '-100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.5, ease: 'circOut', delay: 0.2 }}
      >
        <Image src="https://picsum.photos/64/64" alt="Tim Chinye Profile Picture" width={64} height={64} />
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const TigerHoverEffect = () => (
  <motion.div
    className="absolute inset-0"
    initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* <PortfolioIcon className="size-12 text-orange-500" strokeClass="fill-white" /> *./}
    <PortfolioIcon className="size-12 text-orange-500" />
  </motion.div>
);
*/

type NavbarLogoProps = {
  variant: 'tim' | 'tiger';
  wipeProgress: MotionValue<number>;
  wipeDirection: WipeDirection | null;
};

export function NavbarLogo({
  // variant,
  wipeProgress,
  wipeDirection,
}: NavbarLogoProps) {
  // const [isHovered, setIsHovered] = useState(false);
  const { resolvedTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const animatedFilter = useTransform(
    wipeProgress,
    [0, 100],
    wipeDirection === "top-down"
      ? ["invert(0)", "invert(1)"]
      : ["invert(1)", "invert(0)"]
  );

  const idleFilter = mounted && resolvedTheme === "dark" ? "invert(1)" : "invert(0)";

  return (
    <div
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      className="relative pointer-events-auto text-black"
    >
      <motion.div style={{ filter: wipeDirection ? animatedFilter : idleFilter }}>
        <PortfolioIcon className="size-12 text-black" strokeClass="fill-white" />
      </motion.div>
    </div>
  );
}