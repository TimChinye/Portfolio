// src/components/Navbar/HamburgerIcon.tsx
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { usePathname } from 'next/navigation';
import type { NavLayout } from "./index";
import type { NavLinkItem } from './config';

type HamburgerIconProps = {
  isHovered: boolean;
  isScrambling: boolean;
  links: readonly NavLinkItem[];
  layout: NavLayout;
  isOpen: boolean;
  onClick: () => void;
};

export function HamburgerIcon({ isHovered, isScrambling, links, layout, isOpen, onClick }: HamburgerIconProps) {
  const pathname = usePathname();
  const { positions, navCenterY } = layout;

  const lineCount = links.length;
  const compactSpacing = 8;
  const totalCompactHeight = (lineCount - 1) * compactSpacing;
  const startY = -totalCompactHeight / 2;

  // Common transition for all animations
  const transition = { type: "spring", stiffness: 400, damping: 30 } as const;

  return (
    <>
      {/* --- Mobile Version (Button) --- */}
      <button
        className="relative w-8 h-8 flex items-center justify-center md:hidden"
        onClick={onClick}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {/* We map over links to dynamically get 2 or 3 lines */}
        {links.map((_, index) => {
          const defaultY = startY + index * compactSpacing;
          const isTop = index === 0;
          // Middle line only exists if there are 3 links
          const isMiddle = index === 1 && lineCount === 3;
          const isBottom = index === lineCount - 1;

          let animateProps = { y: defaultY, rotate: 0, scale: 1 };
          if (isOpen) {
            if (isTop) animateProps = { y: 0, rotate: 45, scale: 1 };
            else if (isMiddle) animateProps = { y: 0, rotate: 0, scale: 0 }; // Middle line scales to 0
            else if (isBottom) animateProps = { y: 0, rotate: -45, scale: 1 };
          }

          return (
            <motion.span
              key={index}
              className="absolute block h-0.5 bg-current origin-center w-3/4"
              initial={false}
              animate={animateProps}
              transition={transition}
            />
          );
        })}
      </button>

      {/* --- Desktop Version (Animated Links) --- */ console.log('-----') }
      <div className="relative w-8 h-full hidden md:flex items-center justify-center">
        {links.map((link, index) => {
          const currentPage = pathname.split('/').pop() || '';
          const isLinkActive = currentPage === link.key;
          console.log([currentPage, link.key, isLinkActive]);
          const isHomeActive = !pathname.includes('about') && !pathname.includes('projects') && !pathname.includes('contact');
          const defaultY = startY + index * compactSpacing;
          const absoluteLinkY = positions[index];
          const hoverY = absoluteLinkY !== undefined && navCenterY
            ? absoluteLinkY - navCenterY
            : defaultY;

          return (
            <motion.div
              key={link.key}
              className="absolute w-full"
              initial={false}
              animate={{ y: (isScrambling || isHovered) ? hoverY : defaultY }}
              transition={transition}
            >
              <Link
                href={link.href}
                aria-label={link.label}
                className="block w-full h-full py-1.5 hover:text-[#948D00] hover:dark:text-[#D9D24D]"
              >
                <motion.span
                  className="block h-0.5 bg-current"
                  initial={false}
                  animate={{ width: isLinkActive || isHomeActive ? '100%' : '75%' }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}