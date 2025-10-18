import { Metadata } from 'next';
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";


import { SanityLive } from "@/sanity/lib/live";
import { getPageSeo } from '@/sanity/lib/queries';
import { DisableDraftMode } from "@/components/DisableDraftMode";

export default async function PortfolioLayout({
  children,
  // params
}: Readonly<{
  children: React.ReactNode;
  // params: Promise<{ variant: 'tim' | 'tiger' }>;
}>) {
  // const { variant } = await params; 
  // const content = await getMetaData(variant);

  return (
    <>
      {children}
      {/* <footer>{ content?.defaultSeoDescription }</footer> */}

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

  console.log(seoData?.global);

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
      } catch (error) {
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