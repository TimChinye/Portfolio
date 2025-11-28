import React from 'react';
import { Metadata } from 'next';
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import { SanityLive } from "@/sanity/lib/live";
import { getGlobalContent } from '@/sanity/lib/queries';
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
            bgClasses="bg-[#F5F5EF] dark:bg-[#575753]" 
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

export async function generateMetadata({ params }: {
  params: Promise<{ variant: 'tim' | 'tiger' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const variant = resolvedParams.variant as 'tim' | 'tiger';
  
  // Fetch global content to determine Site Name and Base URL
  const globalData = await getGlobalContent();

  // 1. Determine Site Name based on Variant
  const timName = globalData?.timFullName || "Tim Chinye";
  const tigerName = globalData?.tigerFullName || "Tiger";
  const siteName = variant === 'tim' ? timName : tigerName;

  // 2. Determine Description based on Variant
  const defaultDescription = globalData?.defaultSeoDescription || "The professional portfolio of Tim Chinye.";
  const description = variant === 'tim' 
    ? defaultDescription 
    : "Welcome to the digital playground of Tiger. Explore interactive projects, creative coding experiments, and unique web artistry.";

  // 3. Define the Title Template
  // format: "Site Name | Page Name"
  const titleTemplate = `${siteName} | %s`;
  const defaultTitle = `${siteName} | Home`;

  // 4. Canonical URL logic
  let metadataBase: URL | undefined = undefined;
  if (globalData?.siteUrl) {
    try {
      metadataBase = new URL(globalData.siteUrl);
    } catch (e) {
      console.error("Invalid siteUrl in Sanity", e);
    }
  } else {
    // Fallback if CMS data is missing
    metadataBase = new URL('https://timchinye.com');
  }

  return {
    metadataBase,
    title: {
      default: defaultTitle, // Used when a child page doesn't specify a title (e.g. Home)
      template: titleTemplate, // Used when a child page specifies a title (e.g. Contact -> "Tim Chinye | Contact")
    },
    description: description,
    openGraph: {
      title: {
        default: defaultTitle,
        template: titleTemplate,
      },
      description: description,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
      url: globalData?.siteUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: {
        default: defaultTitle,
        template: titleTemplate,
      },
      description: description,
    },
    alternates: {
      canonical: '/',
    },
  };
}