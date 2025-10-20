// src/components/Navbar/MobileNavOverlay.tsx
"use client";

import Link from 'next/link';
import { motion } from 'motion/react';
import { Figtree } from "next/font/google";

import type { NavLinkItem } from './config';

const figtree = Figtree({ subsets: ["latin"] });

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
  return (
    <motion.div
      className="fixed inset-0 bg-[#F0EFEA] text-[#7A7400] z-9999" // z-index is lower than the navbar
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex flex-col h-full"> {/* Add padding to push content below the fixed navbar */}
        <nav className="flex-grow flex flex-col items-center justify-center">
          <ul className="flex flex-col items-center gap-8">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`text-4xl uppercase font-newsreader`}
                >
                  {linkLabelMap[link.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex justify-center items-center gap-8 pb-12">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm tracking-widest ${figtree.className}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}