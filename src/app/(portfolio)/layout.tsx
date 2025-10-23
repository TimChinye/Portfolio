"use client";

import { useParams } from 'next/navigation';

import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function PortfolioLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { variant } = useParams() as { variant: 'tim' | 'tiger' };
  console.log(variant);

  return (
    <>
      {children}

      <ContactSection variant={variant} />
      <Footer variant={variant} />
    </>
  );
}