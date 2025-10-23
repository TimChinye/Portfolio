import { HeroSection } from './_components/HeroSection';
import { AboutSection } from './_components/AboutSection';
import { StretchyGraphicSection } from './_components/StretchyGraphicSection';
import { FeaturedProjectsSection } from './_components/FeaturedProjectsSection';
import { WorkGraphicSection } from './_components/WorkGraphicSection';

export default async function HomePage({
  params
}: Readonly<{
  params: Promise<{ variant: 'tim' | 'tiger' }>;
}>) {
  const { variant } = await params;

  return (
    <>
      <HeroSection variant={variant} />
      <AboutSection variant={variant} />
      <StretchyGraphicSection />
      <FeaturedProjectsSection variant={variant} />
      <WorkGraphicSection />
    </>
  );
};