"use client";

import { useParams } from "next/navigation";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ProgressBar } from '@/components/features/ProgressBar';
import { Navbar } from '@/components/shared/Navbar';
import { Favicon } from '@/components/shared/Favicon';

export default function PortfolioLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const variant = params.variant as 'tim' | 'tiger';

  return (
    <>
      <Favicon variant={variant || 'tim'} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ProgressBar />
        <Navbar />
        {children}
      </ThemeProvider>
    </>
  );
}