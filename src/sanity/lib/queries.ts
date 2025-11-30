import { groq } from 'next-sanity';
import { client } from './client';
import { sanityFetch } from "@/sanity/lib/live";

// Import Mock Data
import { mockProjects, USE_MOCK_DATA } from './mockData';
const useMock = process.env.NODE_ENV === 'development' && USE_MOCK_DATA;

export interface GlobalContentData {
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  timFullName: string;
  timHeroName: string;
  timHeroBio: string;
  tigerFullName: string;
  tigerHeroName: string;
  tigerHeroBio: string;
  siteUrl: string;
}

export async function getGlobalContent(): Promise<GlobalContentData | null> {
  const query = groq`*[_type == "globalContent"][0]{
    defaultSeoTitle,
    defaultSeoDescription,
    timFullName,
    timHeroName,
    timHeroBio,
    tigerFullName,
    tigerHeroName,
    tigerHeroBio,
    siteUrl
  }`;
  
  const data = await client.fetch<GlobalContentData | null>(query);
  return data;
};

interface Cta {
  label: string;
  url: string;
}

export interface HeroProject {
  _id: string;
  title: string;
  slug: { current: string };
  thumbnailUrl: string;
  shortDescription: string;
  techDescription: string;
  ctaPrimary: Cta;
  ctaSecondary?: Cta;
  ctaTextLink?: Cta;
}

export async function getHeroProjects(variant: 'tim' | 'tiger'): Promise<HeroProject[]> {
  if (useMock) return mockProjects.filter(p => (p.visibility as readonly string[]).includes(variant));

  const query = groq`*[_type == "projectContent" && $variant in visibility] {
    _id,
    title,
    slug,
    "thumbnailUrl": thumbnail.asset->url,
    thumbnail,
    shortDescription,
    techDescription,
    ctaPrimary,
    ctaSecondary,
    ctaTextLink
  }`;
  
  const projects = await client.fetch<any[]>(query, { variant });
  return projects;
}

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

export interface FeaturedProject {
  _id: string;
  title: string;
  slug: { current: string };
  thumbnailUrl: string; // URL will be pre-built
  featuredDescription: string;
}

export async function getFeaturedProjects(variant: 'tim' | 'tiger'): Promise<FeaturedProject[]> {
  if (useMock) return mockProjects.filter(p => (p.visibility as readonly string[]).includes(variant) && p.featuredDescription).slice(0, 3);

  const query = groq`*[_type == "projectContent" && $variant in visibility && defined(featuredDescription) && featuredDescription != ''] | order(dateCompleted desc) [0...3] {
    _id,
    title,
    slug,
    "thumbnailUrl": thumbnail.asset->url,
    thumbnail,
    featuredDescription
  }`;

  const projects = await client.fetch<any[]>(query, { variant });
  return projects;
}

interface ThemeImage {
  light?: string;
  dark?: string;
}

export interface ContactMethod {
  _key: string;
  _type: 'singleLink' | 'splitLink';
  
  label?: string;
  url?: string;
  qrCode?: ThemeImage;
  
  leftLabel?: string;
  leftUrl?: string;
  leftQrCode?: ThemeImage;

  rightLabel?: string;
  rightUrl?: string;
  rightQrCode?: ThemeImage;
}

export interface ContactPageData {
  directTitle: string;
  contactMethods: ContactMethod[];
  emailTitle: string;
  emailAddress: string;
  emailQrCode?: ThemeImage;
}

export async function getContactPageData(variant: 'tim' | 'tiger'): Promise<ContactPageData | null> {
  const methodsField = variant === 'tim' ? 'timContactMethods' : 'tigerContactMethods';
  const emailAddrField = variant === 'tim' ? 'timEmailAddress' : 'tigerEmailAddress';
  const emailQrField = variant === 'tim' ? 'timEmailQrCode' : 'tigerEmailQrCode';

  const getBothQRThemes = `{ "light": light.asset->url, "dark": dark.asset->url }`;

  const query = groq`*[_type == "pageContact"][0]{
    directTitle,
    emailTitle,
    "contactMethods": ${methodsField}[]{
      _key,
      _type,
      label,
      url,
      "qrCode": qrCode${getBothQRThemes},
      
      leftLabel,
      leftUrl,
      "leftQrCode": leftQrCode${getBothQRThemes},
      
      rightLabel,
      rightUrl,
      "rightQrCode": rightQrCode${getBothQRThemes}
    },
    "emailAddress": ${emailAddrField},
    "emailQrCode": ${emailQrField}${getBothQRThemes}
  }`;

  const data = await sanityFetch({ query });
  return data.data;
}

export interface HighlightedProject {
  _id: string;
  title: string;
  slug: { current: string };
  dateCompleted: string;
  isNew: boolean;
}

export async function getHighlightedProjects(variant: 'tim' | 'tiger'): Promise<HighlightedProject[]> {
  if (useMock) return mockProjects.filter(p => (p.visibility as readonly string[]).includes(variant) && p.isHighlighted).sort((a, b) => a.isNew === b.isNew ? new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime() : a.isNew ? -1 : 1).slice(0, 3);

  const query = groq`*[_type == "projectContent" && $variant in visibility && isHighlighted == true] | order(isNew desc, dateCompleted desc) [0...3] {
    _id,
    title,
    slug,
    dateCompleted,
    isNew
  }`;

  const projects = await client.fetch<HighlightedProject[]>(query, { variant });
  return projects;
}

export interface ProjectDetails {
  _id: string;
  title: string;
  dateCompleted: string;
  shortDescription: string;
  techDescription: string;
  featuredDescription: string;
  thumbnailUrl: string;
  ctaPrimary?: Cta;
  ctaSecondary?: Cta;
  ctaTextLink?: Cta;
}

export async function getProjectBySlug(slug: string, variant: 'tim' | 'tiger'): Promise<ProjectDetails | null> {
  if (useMock) return mockProjects.find(p => p.slug.current === slug && (p.visibility as readonly string[]).includes(variant)) || null;

  const query = groq`*[_type == "projectContent" && slug.current == $slug && $variant in visibility][0]{
    _id,
    title,
    dateCompleted,
    shortDescription,
    techDescription,
    featuredDescription,
    "thumbnailUrl": thumbnail.asset->url,
    ctaPrimary,
    ctaSecondary,
    ctaTextLink
  }`;

  const project = await client.fetch<ProjectDetails | null>(query, { slug, variant });
  return project;
}

export interface DiscoveryProject {
  _id: string;
  title: string;
  slug: { current: string };
  dateCompleted: string;
  shortDescription: string;
  thumbnailUrl: string;
}

export async function getAllProjects(variant: 'tim' | 'tiger'): Promise<DiscoveryProject[]> {
  if (useMock) return mockProjects.filter(p => (p.visibility as readonly string[]).includes(variant)).sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());

  const query = groq`*[_type == "projectContent" && $variant in visibility] | order(dateCompleted desc) {
    _id,
    title,
    slug,
    dateCompleted,
    shortDescription,
    "thumbnailUrl": thumbnail.asset->url
  }`;

  const projects = await client.fetch<DiscoveryProject[]>(query, { variant });
  return projects;
}