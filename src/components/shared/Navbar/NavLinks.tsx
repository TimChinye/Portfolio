"use client";

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, memo } from 'react';

import { navLinkTexts } from './NavLinkTexts';
import { ScramblingText } from './ScramblingText';
import type { NavLayout } from './index';

import { CustomLink as Link } from "@/components/ui/CustomLink";

type NavLinkItem = {
  href: string;
  key: 'about' | 'projects' | 'contact';
  label: string;
};

type NavLinksProps = {
  links: readonly NavLinkItem[];
  onLayoutChange: (layout: NavLayout) => void;
  onScrambleChange: (isActive: boolean) => void;
};

export const NavLinks = memo(function NavLinks({ links, onLayoutChange, onScrambleChange }: NavLinksProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  // Use a single ref containing an array of refs - stable across renders
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  // Ensure linkRefs array has the right length
  linkRefs.current = links.map((_, i) => linkRefs.current[i] ?? null);

  // Measures the vertical position of each link to align the mobile "hamburger" indicator
  useLayoutEffect(() => {
    const calculateLayout = () => {
      if (!navRef.current) return;
      
      const navRect = navRef.current.getBoundingClientRect();
      const navTop = navRect.top;
      
      const positions = linkRefs.current.map((el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
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
            ref={(el) => { linkRefs.current[index] = el; }}
            key={link.key}
            href={link.href}
            className={`flex items-center text-sm hover:text-[#948D00] hover:dark:text-[#D9D24D] ${isActive ? 'font-bold' : ''}`}
          >
            <ScramblingText textOptions={textOptions} onScrambleChange={onScrambleChange} />
          </Link>
        );
      })}
    </nav>
  );
});

NavLinks.displayName = 'NavLinks';