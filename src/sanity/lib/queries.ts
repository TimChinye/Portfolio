import { groq } from 'next-sanity';
import { client } from './client';
import { sanityFetch } from "@/sanity/lib/live";

interface MetaData {
  defaultSeoTitle: string;
  defaultSeoDescription: string;
}

export async function getMetaData(): Promise<MetaData | null> {
  const query = groq`*[_type == "globalContent"][0]{
    defaultSeoTitle,
    defaultSeoDescription
  }`;
  
  const { data } = await sanityFetch({ query });
  return data;
};

interface GlobalSeoData {
  siteName: string;
  siteUrl: string;
}

interface PageSeoData {
  seoTitle: string;
  seoDescription: string;
}

interface CombinedSeoData {
  global: GlobalSeoData;
  page: PageSeoData;
}

/**
 * Fetches SEO data for a specific page using the reliable base client.
 */
export async function getPageSeo(page: 'home' | 'about' | 'projects' | 'contact'): Promise<CombinedSeoData | null> {
  const documentType = `page${page.charAt(0).toUpperCase() + page.slice(1)}`;

  const query = groq`{
    "global": *[_type == "globalContent"][0]{
      "siteName": timHeroName,
      "siteUrl": siteUrl
    },
    "page": *[_type == "${documentType}"][0]{
      seoTitle,
      seoDescription
    }
  }`;
  
  const data = await client.fetch<CombinedSeoData | null>(query);
  return data;
}

interface NotFoundPageData {
  errorCode: string;
  errorMessage: string;
  subheading: string;
  buttonText: string;
}

export async function getNotFoundPage(): Promise<NotFoundPageData | null> {
  const query = groq`*[_type == "pageNotFound"][0]{
    errorCode,
    errorMessage,
    subheading,
    buttonText
  }`;
  
  const { data } = await sanityFetch({ query });
  return data;
}

export interface NavbarData {
  timPfp: {
    asset: {
      _ref: string;
      _type: 'reference';
    }
  };
}

export async function getNavbarData(): Promise<NavbarData | null> {
  const query = groq`*[_type == "globalContent"][0]{
    "timPfp": timPfp
  }`;
  const { data } = await sanityFetch({ query });
  return data;
}

interface FooterData {
  copyrightText: string;
  socialLinks: { label: string; href: string }[];
}

export async function getFooterData(variant: 'tim' | 'tiger'): Promise<FooterData | null> {
  const socialLinksField = variant === 'tim' ? 'timFooterLinks' : 'tigerFooterLinks';
  const query = groq`*[_type == "globalContent"][0]{
    copyrightText,
    "socialLinks": ${socialLinksField}[]{'label': label, 'href': url}
  }`;

  const { data } = await sanityFetch({ query });
  return data;
}

export interface AboutPageData {
  topParagraph: string;
  bottomParagraph: string;
  journeyButtonText: string;
  playbackId: string;
}

export async function getAboutPageData(): Promise<AboutPageData | null> {
  const query = groq`*[_type == "pageAbout"][0]{
    topParagraph,
    bottomParagraph,
    journeyButtonText,
    "playbackId": (backgroundVideo.asset->).playbackId
  }`;
    
  const { data } = await sanityFetch({ query });
  return data;
}