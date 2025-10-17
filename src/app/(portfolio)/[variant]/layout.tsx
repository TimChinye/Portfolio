import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";


import { SanityLive } from "@/sanity/lib/live";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { getGlobalContent } from '@/sanity/lib/queries';

export default async function PortfolioLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ variant: 'tim' | 'tiger' }>;
}>) {
  const { variant } = await params; 
  // const content = await getGlobalContent(variant);

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