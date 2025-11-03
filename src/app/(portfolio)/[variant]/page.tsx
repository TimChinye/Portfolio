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

  const sections = [
    {
      Component: HeroSection,
      props: {
        key: 'hero',
        bgClasses: "bg-[#F5F5EF] dark:bg-[#1A1A17]",
        className: "content-center",
        variant: variant,
      }
    },
    {
      Component: AboutSection,
      props: {
        key: 'about',
        as: "section",
        textClasses: "text-[#F5F5EF] dark:text-[#2F2F2B]",
        bgClasses: "bg-[#2F2F2B] dark:bg-[#b2b250]",
        scaleRange: [0.75, 1],
        yRange: ['8rem', '0rem'],
        className: "flex items-center justify-center",
        variant: variant,
      }
    },
    {
      Component: StretchyGraphicSection,
      props: {
        key: 'stretchy',
        as: "section",
        bgClasses: "bg-[#E4E191] dark:bg-[#2F2F2B]",
        className: "flex items-center justify-center max-md:z-1 max-md:rounded-[8rem] text-black dark:text-white",
        variant: variant
      }
    },
    {
      Component: FeaturedProjectsSection,
      props: {
        key: 'featured',
        as: "section",
        bgClasses: "bg-[#EFEFD0] dark:bg-[#1A1A17]",
        textClasses: "text-black dark:text-white",
        className: "flex items-center justify-center max-md:rounded-none",
        variant: variant,
      }
    },
    {
      Component: WorkGraphicSection,
      props: {
        key: 'work',
        as: "section",
        bgClasses: "bg-[#DEDA71] dark:bg-[#2F2F2B]",
        textClasses: "text-black dark:text-white",
        className: "flex items-center justify-center",
        variant: variant,
      }
    }
  ] as const;

  return (
    <>
      {sections.map(({ Component, props }) => {
        const { key, ...restOfProps } = props;
        
        return <Component key={key} {...restOfProps} />;
      })}
    </>
  );
};