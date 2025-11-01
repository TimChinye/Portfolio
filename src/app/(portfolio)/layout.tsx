"use client";

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ProgressBar } from '@/components/features/ProgressBar';
import { Navbar } from '@/components/shared/Navbar';

export default function PortfolioLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ProgressBar />
        <Navbar />
        {children}
      </ThemeProvider>
    </>
  );
}