import { HeroSection } from './_components/HeroSection';
import { AboutSection } from './_components/AboutSection';
import { StretchyGraphicSection } from './_components/StretchyGraphicSection';
import { FeaturedProjectsSection } from './_components/FeaturedProjectsSection';
import { WorkGraphicSection } from './_components/WorkGraphicSection';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
        className: "text-center content-center",
        variant: variant,
      }
    },
    {
      Component: AboutSection,
      props: {
        key: 'about',
        as: "section",
        noWrapperBg: true,
        bgClasses: "bg-[#2F2F2B]",
        textClasses: "text-[#F5F5EF]",
        scaleRange: [0.75, 1],
        ease: {
          scale: [0.5, 0.5, 0, 1],
          y: [0, 0, 0, 1]
        },
        yRange: {
          desktop: ['0rem', '-8rem'],
          mobile: ['0rem', '-6rem'],
        },
        stickyDuration: "300vh",
        className: "-mb-1 text-[clamp(4rem,15vw,12rem)]",
        variant: variant,
      }
    },
    {
      Component: StretchyGraphicSection,
      props: {
        key: 'stretchy',
        as: "section",
        bgClasses: "bg-[#E4E191] dark:bg-[#43433e]",
        className: "flex items-center justify-center max-md:z-1 max-md:rounded-[8rem] text-black dark:text-white text-[clamp(4rem,15vw,12rem)]",
        variant: variant,
        animationRange: {
          mobile: ["0.5 1", "1 1"], 
          desktop: ["0 1", "0.5 1"]
        }
      }
    },
    {
      Component: FeaturedProjectsSection,
      props: {
        key: 'featured',
        as: "section",
        bgClasses: "bg-[#EFEFD0] dark:bg-[#1A1A17]",
        textClasses: "text-black dark:text-white",
        wrapperClassName: "m-0",
        className: "-translate-y-24 md:-translate-y-32 h-0",
        variant: variant,
      }
    },
    {
      Component: WorkGraphicSection,
      props: {
        key: 'work',
        as: "section",
        bgClasses: "bg-[#DEDA71] dark:bg-[#393935]",
        textClasses: "text-black dark:text-white",
        className: "-translate-y-24 md:-translate-y-32 -mb-1 flex items-end h-screen pt-24 md:pt-32 px-[0.5em] md:px-[0.75em] text-[clamp(4rem,15vw,12rem)]",
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