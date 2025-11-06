import React, { Children, isValidElement, ReactElement, ReactNode } from 'react';
import { Metadata } from 'next';
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import { SanityLive } from "@/sanity/lib/live";
import { getPageSeo } from '@/sanity/lib/queries';
import { DisableDraftMode } from "@/components/ui/DisableDraftMode";
import { PageTransition } from '@/components/features/PageTransition';
import { ContactSection } from '@/components/shared/ContactSection';
import { Footer } from '@/components/shared/Footer';

export default async function PageLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ variant: string }>;
}>) {
  const resolvedParams = await params;
  const variant = resolvedParams.variant as 'tim' | 'tiger';

  return (
    <>
      <PageTransition>
        <div className="flex flex-col">
          {children}

          <ContactSection
            as="section"
            bgClasses="bg-[#F5F5EF] dark:bg-[#707067]" 
            textClasses="text-[#2F2F2B] dark:text-[#F5F5EF]"
            variant={variant}
          />

          <Footer
            as="footer"
            bgClasses="bg-[#E9E8B1] dark:bg-[#2F2F2B]"
            textClasses="text-[#7A751A] dark:text-[#F5F5EF]"
            className="font-medium content-center text-center"
            variant={variant}
          />
        </div>
      </PageTransition>

      <SanityLive />
      
      {(await draftMode()).isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  );
}

type Props = {
  params: Promise<{ variant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const variant = resolvedParams.variant as 'tim' | 'tiger';
  
  const seoData = await getPageSeo('home');

  // --- Primary Logic: Use CMS data if available ---
  if (seoData?.global) {
    const { global, page } = seoData;
    const siteName = global.siteName || "Tim Chinye";

    const baseTitle = page?.seoTitle ?? "Professional Portfolio";
    const baseDescription = page?.seoDescription ?? `The professional portfolio of ${siteName}. Explore projects in frontend development and creative technology.`;

    const titlePersona = variant === 'tim' ? baseTitle : "TigerYT | Creative Coder & Digital Artist";
    const descriptionPersona = variant === 'tim' ? baseDescription : "Welcome to the digital playground of Tiger. Explore interactive projects, creative coding experiments, and unique web artistry.";

    const fullTitle = `${titlePersona} | ${siteName}`;

    const metadata: Metadata = {
      title: fullTitle,
      description: descriptionPersona,
      openGraph: {
        title: fullTitle,
        description: descriptionPersona,
        siteName: siteName,
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description: descriptionPersona,
      },
    };

    if (global.siteUrl) {
      try {
        metadata.metadataBase = new URL(global.siteUrl);
        metadata.alternates = { canonical: '/' };
        if (metadata.openGraph) {
          metadata.openGraph.url = global.siteUrl;
        }
      } catch {
        console.error("Invalid 'siteUrl' from Sanity, cannot generate canonical link:", global.siteUrl);
      }
    }
    return metadata;
  }

  // This block runs ONLY if the CMS data (`seoData.global`) could not be fetched.
  console.warn("CMS data not found. Using hardcoded metadata fallback.");

  const canonicalUrl = 'https://timchinye.com';
  const siteName = "Tim Chinye";

  const fallbackTitle = variant === 'tim' 
    ? `Professional Portfolio | ${siteName}` 
    : `TigerYT | Creative Coder & Digital Artist | ${siteName}`;

  const fallbackDescription = variant === 'tim'
    ? `The professional portfolio of ${siteName}. Explore projects in frontend development and creative technology.`
    : "Welcome to the digital playground of Tiger. Explore interactive projects, creative coding experiments, and unique web artistry.";

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    // --- The hardcoded canonical link ---
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: '/',
    },
    // --- Other useful hardcoded metadata ---
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
      url: canonicalUrl,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fallbackTitle,
      description: fallbackDescription,
    },
  };
}