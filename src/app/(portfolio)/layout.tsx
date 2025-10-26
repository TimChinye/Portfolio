"use client";

import { useParams } from 'next/navigation';

export default function PortfolioLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { variant } = useParams() as { variant: 'tim' | 'tiger' };

  return (
    <>
      {children}
    </>
  );
}