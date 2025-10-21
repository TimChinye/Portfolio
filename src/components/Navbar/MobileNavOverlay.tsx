"use client";

import { useState } from 'react';
import { CustomLink as Link } from "@/components/CustomLink";
import { motion } from 'motion/react';

import type { NavLinkItem } from './config';

const socialLinks = [
  { label: 'CODEPEN', href: 'https://codepen.io' },
  { label: 'GITHUB', href: 'https://github.com' },
  { label: 'LINKEDIN', href: 'https://linkedin.com' },
];

const linkLabelMap = {
  about: 'ABOUT ME',
  projects: 'MY WORK',
  contact: 'CONTACT',
};

type MobileNavOverlayProps = {
  links: readonly NavLinkItem[];
  onClose: () => void;
};

export function MobileNavOverlay({ links, onClose }: MobileNavOverlayProps) {
  const [hoveredMainLink, setHoveredMainLink] = useState<string | null>(null);
  const [hoveredSocialLink, setHoveredSocialLink] = useState<string | null>(null);
  return (
    <motion.div
      className="fixed inset-0 z-9999 bg-[#F0EFEA] dark:bg-[#2c2c28] text-[#948D00] dark:text-[#D9D24D] md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex flex-col h-full">
        <nav className="flex-grow flex flex-col items-center justify-center">
          <ul
            className="flex flex-col items-center gap-8"
            onMouseLeave={() => setHoveredMainLink(null)}
          >
            {links.map((link) => {
              const isAnotherLinkHovered = hoveredMainLink !== null && hoveredMainLink !== link.key;
              return (
                <li
                  key={link.key}
                  className="relative pt-[0.25lh]"
                  onMouseEnter={() => setHoveredMainLink(link.key)}
                >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="text-4xl uppercase font-newsreader transition-opacity duration-300"
                  style={{ opacity: isAnotherLinkHovered ? 0.25 : 1 }}
                >
                  {linkLabelMap[link.key]}
                </Link>
                  <motion.span
                    className="absolute top-1/2 left-0 h-px w-full bg-current"
                    style={{ y: '-50%', originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isAnotherLinkHovered ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
              </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="flex justify-center items-center gap-8 pb-12"
          onMouseLeave={() => setHoveredSocialLink(null)}
        >
          {socialLinks.map((link) => {
            const isAnotherLinkHovered = hoveredSocialLink !== null && hoveredSocialLink !== link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-sm tracking-widest transition-opacity duration-300"
                style={{ opacity: isAnotherLinkHovered ? 0.25 : 1 }}
                onMouseEnter={() => setHoveredSocialLink(link.label)}
              >
                {link.label}
                 <motion.span
                    className="absolute top-1/2 left-0 h-px w-full bg-current"
                    style={{ y: '-50%', originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isAnotherLinkHovered ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
              </a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}