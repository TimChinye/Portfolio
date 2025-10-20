// src/components/Navbar/NavLinks.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, createRef } from 'react';
import { ScramblingText } from './ScramblingText';
import { navLinkTexts } from './NavLinkTexts';
import type { NavLayout } from './index';

type NavLinkItem = {
  href: string;
  key: 'about' | 'portfolio' | 'contact';
  label: string;
};

type NavLinksProps = {
  links: readonly NavLinkItem[];
  onLayoutChange: (layout: NavLayout) => void;
};

export function NavLinks({ links, onLayoutChange }: NavLinksProps) {
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
    // Apply className to the nav element
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
            <ScramblingText textOptions={textOptions} />
          </Link>
        );
      })}
    </nav>
  );
}