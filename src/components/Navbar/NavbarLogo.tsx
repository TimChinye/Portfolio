"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

// Black Logo SVG Component
const BlackLogo = () => (
  <svg className="size-12" width="62" height="64" viewBox="0 0 62 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 64.0002C35.3137 64.0002 38 61.3139 38 58.0002C38 54.6865 35.3137 52.0002 32 52.0002C28.6863 52.0002 26 54.6865 26 58.0002C26 61.3139 28.6863 64.0002 32 64.0002Z" />
    <path d="M32 12.0001C35.3137 12.0001 38 9.31376 38 6.00004C38 2.68632 35.3137 2.12193e-05 32 2.12193e-05C28.6863 2.12193e-05 26 2.68632 26 6.00004C26 9.31376 28.6863 12.0001 32 12.0001Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M26 6.00004L26 58.0002H38L38 6.00004H26Z" />
    <path d="M49 32C50.6568 32 52 30.6569 52 29C52 27.3432 50.6568 26 49 26C47.3431 26 46 27.3432 46 29C46 30.6569 47.3431 32 49 32Z" />
    <path d="M15 42C16.6568 42 18 40.6569 18 39C18 37.3432 16.6568 36 15 36C13.3431 36 12 37.3432 12 39C12 40.6569 13.3431 42 15 42Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M48.136 26.126L49.91 31.86L15.756 41.904L14.194 36.11" />
    <path d="M49 42C50.6568 42 52 40.6569 52 39C52 37.3432 50.6568 36 49 36C47.3431 36 46 37.3432 46 39C46 30.6569 47.3431 42 49 42Z" />
    <path d="M15 52C16.6568 52 18 50.6569 18 49C18 47.3432 16.6568 46 15 46C13.3431 46 12 47.3432 12 49C12 50.6569 13.3431 52 15 52Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M48.136 36.126L49.91 41.86L15.756 51.904L14.194 46.11" />
    <path d="M57 10C59.7614 10 62 7.76143 62 5C62 2.23858 59.7614 0 57 0C54.2386 0 52 2.23858 52 5C52 7.76143 54.2386 10 57 10Z" />
    <path d="M4.99999 10C7.76141 10 9.99999 7.76143 9.99999 5C9.99999 2.23858 7.76141 1.43051e-06 4.99999 1.43051e-06C2.23857 1.43051e-06 -7.62939e-06 2.23858 -7.62939e-06 5C-7.62939e-06 7.76143 2.23857 10 4.99999 10Z" />
    <path d="M57 0L4.99999 1.43051e-06V10L57 10V0Z" />
  </svg>
);

// Orange Logo SVG Component
const OrangeLogo = () => <div className="text-orange-500"><BlackLogo /></div>;

// Component for the 'tim' variant hover effect
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

// Component for the 'tiger' variant hover effect
const TigerHoverEffect = () => (
  <motion.div
    className="absolute inset-0"
    initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <OrangeLogo />
  </motion.div>
);

export function NavbarLogo({ variant }: { variant: "tim" | "tiger" }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative text-black dark:text-white"
    >
      <AnimatePresence>{isHovered && (variant === "tim" ? <TimHoverEffect /> : <TigerHoverEffect />)}</AnimatePresence>
      <BlackLogo />
    </div>
  );
}