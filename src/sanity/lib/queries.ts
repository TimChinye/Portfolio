import { groq } from 'next-sanity';
import { sanityFetch } from "@/sanity/lib/live";

export async function getGlobalContent() {
  const query = groq`*[_type == "globalContent"][0]`;
  
  const { data: globalContent } = await sanityFetch({ query: query });
  return globalContent;
};

export async function getMetaData(): Promise<{ defaultSeoTitle: string; defaultSeoDescription: string; }> {
  const query = groq`*[_type == "globalContent"][0]{
    defaultSeoTitle,
    defaultSeoDescription
  }`;
  
  const { data: metadata } = await sanityFetch({ query });
  return metadata;
;
};