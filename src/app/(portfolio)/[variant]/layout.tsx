// src/app/(portfolio)/[variant]/layout.tsx
import React, { Children, isValidElement, ReactElement, ReactNode } from 'react';
import { Metadata } from 'next';
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import { SanityLive } from "@/sanity/lib/live";
import { getPageSeo } from '@/sanity/lib/queries';
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { PageTransition } from '@/components/PageTransition';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

type SectionStyleProps = { bgColor?: string; darkBgColor?: string };
type ComponentPropsWithChildren = { children?: ReactNode };

// Helper function to find props of the last Section-like component
const getLastSectionProps = (children: ReactNode): SectionStyleProps => {
  const childrenArray = Children.toArray(children);
  
  const findLastProps = (nodes: ReactNode[]): SectionStyleProps => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (isValidElement(node)) {
        // Assert the shape of props to safely access them
        const props = node.props as ComponentPropsWithChildren & SectionStyleProps;
        // If the child is a fragment, recurse into its children
        if ((node.type === React.Fragment || node.type === 'div') && props.children) {
          const nestedProps = findLastProps(Children.toArray(props.children));

          // If a colored section was found in the nested tree, return its props
          if (nestedProps.bgColor) return nestedProps;
        }
        
        // Check if the current node itself has the background props
        if (props.bgColor) {
          return { bgColor: props.bgColor, darkBgColor: props.darkBgColor };
        }
      }
    }

    return {};
  };

  const pageComponent = childrenArray[0] as ReactElement<ComponentPropsWithChildren>;
  if (pageComponent && pageComponent.props.children) {
      const pageContentChildren = Children.toArray(pageComponent.props.children);
      return findLastProps(pageContentChildren);
  }

  return {};
};


export default async function PageLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ variant: 'tim' | 'tiger' }>;
}>) {
  const { variant } = await params;
  
  // Dynamically determine the background colors from the last child of the page
  const lastPageSectionProps = getLastSectionProps(children);

  return (
    <>
      <PageTransition>
        <div className="flex flex-col [&>div:first-child]:mt-0 [&>div:first-child>*]:rounded-none">
          {children}

          <ContactSection
            as="section"
            bgColor="bg-[#ECECAA]"
            darkBgColor="dark:bg-[#4D4121]"
            textColor="text-[#00000080]"
            darkTextColor="text-[#FFFFFF80]"
            // Wrapper gets background from the last page section
            wrapperBgColor={lastPageSectionProps.bgColor || "bg-gray-300"} // Fallback color
            darkWrapperBgColor={lastPageSectionProps.darkBgColor || "dark:bg-gray-700"} // Fallback color
            yRange={['16rem', '0rem']}
            variant={variant}
          />

          <Footer
            as="footer"
            bgColor="bg-[#E9E8B1]"
            darkBgColor="dark:bg-[#2F2F2B]"
            textColor="text-[#7A751A]"
            darkTextColor="text-[#F5F5EF]"
            // Wrapper gets background from the ContactSection
            wrapperBgColor="bg-[#ECECAA]"
            darkWrapperBgColor="dark:bg-[#4D4121]"
            scaleRange={[1.25, 1]}
            yRange={['16rem', '0rem']}
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
  params: { variant: 'tim' | 'tiger' };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
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

  // --- HARDCODED FALLBACK LOGIC ---
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