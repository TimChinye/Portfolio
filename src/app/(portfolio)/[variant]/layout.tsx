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
  
  const globalData = await getGlobalContent();

  const timName = globalData?.timFullName || "Tim Chinye";
  const tigerName = globalData?.tigerFullName || "Tiger";
  const siteName = variant === 'tim' ? timName : tigerName;

  const defaultDescription = globalData?.defaultSeoDescription || "The professional portfolio of Tim Chinye.";
  const description = variant === 'tim' 
    ? defaultDescription 
    : "Welcome to the digital playground of Tiger. Explore interactive projects, creative coding experiments, and unique web artistry.";

  const titleTemplate = `${siteName} | %s`;
  const defaultTitle = `${siteName} | Home`;

  let metadataBase: URL | undefined = undefined;
  if (globalData?.siteUrl) {
    try {
      metadataBase = new URL(globalData.siteUrl);
    } catch (e) {
      console.error("Invalid siteUrl in Sanity", e);
    }
  } else {
    metadataBase = new URL('https://timchinye.com');
  }

  return {
    metadataBase,
    title: {
      default: defaultTitle, 
      template: titleTemplate,
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