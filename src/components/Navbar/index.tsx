// src/components/Navbar/index.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, useMotionValue } from "motion/react";

import { NavLinks } from "./NavLinks";
import { NavbarLogo } from "./NavbarLogo";
import { HamburgerIcon } from "./HamburgerIcon";
import { MobileNavOverlay } from "./MobileNavOverlay";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import type { WipeDirection } from "@/components/ThemeSwitcher/types";
import { CustomLink as Link } from "@/components/ProgressBar/CustomLink";

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
  const variant = (params.variant as "tim" | "tiger") || "tim";

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

  const filteredNavLinks =
    variant === "tiger"
      ? navLinks.filter((link) => link.key !== "about")
      : navLinks;

  return (
    <>
      <nav className="fixed flex items-center p-4 z-100000 gap-4 w-full justify-between md:justify-start">
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
        <div className="group flex h-fit items-center gap-4 rounded-full bg-white/80 py-4 px-6 shadow-lg backdrop-blur-sm dark:bg-black/80 flex-row-reverse md:flex-row">
          <div
            className="gap-[inherit] items-center"
            style={{ display: "inherit" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HamburgerIcon
              isHovered={isHovered}
              isScrambling={isScrambling} // --- Pass state down ---
              links={filteredNavLinks}
              layout={linkLayout}
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            <NavLinks
              links={filteredNavLinks}
              onLayoutChange={setLinkLayout}
              onScrambleChange={setIsScrambling} // --- Pass setter down ---
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