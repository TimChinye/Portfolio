"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";

type NavbarLogoProps = {
  variant: 'tim' | 'tiger';
};

export function NavbarLogo({
  // variant,
}: NavbarLogoProps) {
  const { resolvedTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const idleFilter = mounted && resolvedTheme === "dark" ? "invert(1)" : "invert(0)";

  return (
    <div
      className="relative pointer-events-auto text-black"
    >
      <motion.div style={{ filter: idleFilter }}>
        <PortfolioIcon className="size-12 text-black" strokeClass="fill-white" />
      </motion.div>
    </div>
  );
}