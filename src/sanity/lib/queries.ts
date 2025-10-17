import { groq } from 'next-sanity';
import { sanityFetch } from "@/sanity/lib/live";

export async function getGlobalContent() {
  const query = groq`*[_type == "globalContent"][0]`;
  
  const { data: globalContent } = await sanityFetch({ query: query });
  return globalContent;
};

export async function getMetaData() {
  const query = groq`*[_type == "globalContent"][0]`;
  
  const { data: globalContent } = await sanityFetch({ query: query });
  return globalContent;
};