// src/sanity/lib/queries.ts
import { groq } from 'next-sanity';
// Import the base client directly for server-side data fetching.
import { client } from './client';
// We will still use `sanityFetch` later, but for client-side components.
import { sanityFetch } from "@/sanity/lib/live";

// --- Type Definitions for clear, predictable data shapes ---
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
 * This is the correct approach for `generateMetadata` and other server-side functions.
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
  
  // Using client.fetch() which has simpler and more direct TypeScript support.
  // The generic <T> here defines the expected shape of the query's return value.
  const data = await client.fetch<CombinedSeoData | null>(query);
  
  return data;
}

// ** IMPORTANT NOTE **
// You should still use `sanityFetch` from `live.ts` for data fetching inside
// React Server Components where you want to enable live previews. For example:
//
// export async function getHomePageContent(variant: 'tim' | 'tiger') {
//   const query = groq`...your query for page content...`;
//   const { data } = await sanityFetch({ query });
//   return data;
// }