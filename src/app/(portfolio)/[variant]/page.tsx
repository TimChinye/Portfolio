import { HeroSection } from './_components/HeroSection';
import { AboutSection } from './_components/AboutSection/AboutSection';
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
        bgColor: "bg-[#F5F5EF]",
        darkBgColor: "bg-[#1A1A17]",
        className: "content-center",
        variant: variant,
      }
    },
    {
      Component: AboutSection,
      props: {
        key: 'about',
        as: "section",
        textColor: "text-[#F5F5EF]",
        darkTextColor: "text-[#2F2F2B]",
        bgColor: "bg-[#2F2F2B]",
        darkBgColor: "bg-[#b2b250]",
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
        bgColor: "bg-[#E4E191]",
        darkBgColor: "bg-[#2F2F2B]",
        className: "flex items-center justify-center max-md:z-1 max-md:rounded-[8rem] text-black dark:text-white",
        variant: variant,
      }
    },
    {
      Component: FeaturedProjectsSection,
      props: {
        key: 'featured',
        as: "section",
        bgColor: "bg-[#EFEFD0]",
        darkBgColor: "bg-[#1A1A17]",
        className: "flex items-center justify-center max-md:rounded-none",
        variant: variant,
      }
    },
    {
      Component: WorkGraphicSection,
      props: {
        key: 'work',
        as: "section",
        bgColor: "bg-[#DEDA71]",
        darkBgColor: "bg-[#2F2F2B]",
        className: "flex items-center justify-center text-black dark:text-white",
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