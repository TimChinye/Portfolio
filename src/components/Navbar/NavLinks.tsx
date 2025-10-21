// src/components/Navbar/NavLinks.tsx
"use client";

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, createRef } from 'react';

import { navLinkTexts } from './NavLinkTexts';
import { ScramblingText } from './ScramblingText';
import type { NavLayout } from './index';

import { CustomLink as Link } from "@/components/CustomLink";

type NavLinkItem = {
  href: string;
  key: 'about' | 'projects' | 'contact';
  label: string;
};

type NavLinksProps = {
  links: readonly NavLinkItem[];
  onLayoutChange: (layout: NavLayout) => void;
  onScrambleChange: (isActive: boolean) => void; // --- Update prop type ---
};

export function NavLinks({ links, onLayoutChange, onScrambleChange }: NavLinksProps) {
  // --- State is removed from here ---
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(links.map(() => createRef<HTMLAnchorElement>()));

  useLayoutEffect(() => {
    const calculateLayout = () => {
      if (!navRef.current) return;
      
      const navRect = navRef.current.getBoundingClientRect();
      const navTop = navRect.top;
      
      const positions = linkRefs.current.map((ref) => {
        if (!ref.current) return 0;
        const rect = ref.current.getBoundingClientRect();
        return (rect.top - navTop) + (rect.height / 2);
      });

      const navCenterY = navRect.height / 2;

      onLayoutChange({ positions, navCenterY });
    };

    calculateLayout();

    const resizeObserver = new ResizeObserver(calculateLayout);
    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [links, onLayoutChange]);

  return (
    <nav ref={navRef} className={`peer/nav h-full flex-col justify-between hidden md:flex`}>
      {links.map((link, index) => {
        const isActive = pathname.endsWith(link.href);
        const textOptions = navLinkTexts.map(option => option[link.key]);

        return (
          <Link
            ref={linkRefs.current[index]}
            key={link.key}
            href={link.href}
            className={`flex items-center text-sm hover:text-[#948D00] hover:dark:text-[#D9D24D] ${isActive ? 'font-bold' : ''}`}
          >
            {/* --- Pass the onScrambleChange prop through --- */}
            <ScramblingText textOptions={textOptions} onScrambleChange={onScrambleChange} />
          </Link>
        );
      })}
    </nav>
  );
}