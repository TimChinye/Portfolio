import { groq } from 'next-sanity';
import { client } from './client';
import { sanityFetch } from "@/sanity/lib/live";

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

interface NotFoundPageData {
  errorCode: string;
  errorMessage: string;
  subheading: string;
  buttonText: string;
}

export async function getMetaData(): Promise<{ defaultSeoTitle: string; defaultSeoDescription: string; }> {
  const query = groq`*[_type == "globalContent"][0]{
    defaultSeoTitle,
    defaultSeoDescription
  }`;
  
  const { data: metadata } = await sanityFetch({ query });
  return metadata;
};

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