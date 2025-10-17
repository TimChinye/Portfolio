import { groq } from 'next-sanity';
import { sanityFetch } from "@/sanity/lib/live";

export async function getGlobalContent(variant: 'tim' | 'tiger') {
  const query = groq`*[_type == "globalContent"][0]
  
    ...select(
      $variant == "tim" => timHeroName ?? heroName,
      $variant == "tiger" => tigerContent
    )
  
  `;
  
  const { data: globalContent } = await sanityFetch({ query: query });
  return globalContent;
};