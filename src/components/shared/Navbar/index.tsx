// src/components/Navbar/index.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { AnimatePresence, useMotionValue } from "motion/react";

import { NavLinks } from "./NavLinks";
import { NavbarLogo } from "./NavbarLogo";
import { HamburgerIcon } from "./HamburgerIcon";
import { MobileNavOverlay } from "./MobileNavOverlay";

import { ThemeSwitcher } from "@/components/features/ThemeSwitcher";
import { CustomLink as Link } from "@/components/ui/CustomLink";
import type { WipeDirection } from "@/components/features/ThemeSwitcher/types";

const navLinks = [
  { href: '/about', key: 'about', label: 'About' },
  { href: '/projects', key: 'projects', label: 'Projects' },
  { href: '/contact', key: 'contact', label: 'Contact' },
] as const;

export type NavLayout = {
  positions: number[];
  navCenterY: number;
};

export function Navbar() {
  const params = useParams();
  const variant = params.variant as 'tim' | 'tiger';

  const [isHovered, setIsHovered] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [linkLayout, setLinkLayout] = useState<NavLayout>({
    positions: [],
    navCenterY: 0,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const wipeProgress = useMotionValue(0);
  const [wipeDirection, setWipeDirection] = useState<WipeDirection | null>(
    null
  );

  const filteredNavLinks = useMemo(() => {
    return variant === 'tiger'
      ? navLinks.filter((link) => link.key !== "about")
      : navLinks;
  }, [variant]);

  return (
    <>
      <nav
        className="fixed flex items-center p-4 z-100000 gap-4 w-full justify-between md:justify-start pointer-events-none"
        data-html2canvas-ignore="true"
      >
        <Link
          href="/"
          aria-label="Return to homepage"
          onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
        >
          <NavbarLogo
            variant={variant}
            wipeProgress={wipeProgress}
            wipeDirection={wipeDirection}
          />
        </Link>
        <div className="group pointer-events-auto flex h-fit items-center gap-4 rounded-full bg-white/75 py-4 px-6 shadow-lg backdrop-blur-sm dark:bg-black/75 flex-row">
          <div
            className="gap-[inherit] items-center order-1 md:order-0"
            style={{ display: "inherit" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HamburgerIcon
              isHovered={isHovered}
              isScrambling={isScrambling} // Pass state down
              links={filteredNavLinks}
              layout={linkLayout}
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            <NavLinks
              links={filteredNavLinks}
              onLayoutChange={setLinkLayout}
              onScrambleChange={setIsScrambling} // Pass setter down
            />
          </div>
          <ThemeSwitcher
            wipeProgress={wipeProgress}
            wipeDirection={wipeDirection}
            setWipeDirection={setWipeDirection}
          />
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNavOverlay
            links={filteredNavLinks}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}