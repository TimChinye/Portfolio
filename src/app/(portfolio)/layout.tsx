"use client";

import { useParams } from "next/navigation";
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
      <ProgressBar />
      <Navbar />
      {children}
    </>
  );
}