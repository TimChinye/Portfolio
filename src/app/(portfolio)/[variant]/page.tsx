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
        bgColor: "bg-slate-100",
        darkBgColor: "dark:bg-slate-900",
        className: "py-0",
        variant: variant,
      }
    },
    {
      Component: AboutSection,
      props: {
        key: 'about',
        as: "section",
        bgColor: "bg-zinc-200",
        darkBgColor: "dark:bg-zinc-800",
        scaleRange: [0.75, 1],
        yRange: ['16rem', '0rem'],
        className: "flex items-center justify-center",
        variant: variant,
      }
    },
    {
      Component: StretchyGraphicSection,
      props: {
        key: 'stretchy',
        as: "section",
        bgColor: "bg-neutral-300",
        darkBgColor: "dark:bg-neutral-700",
        radiusRange: ['32rem', '8rem'],
        className: "flex items-center justify-center text-black dark:text-white",
      }
    },
    {
      Component: FeaturedProjectsSection,
      props: {
        key: 'featured',
        as: "section",
        bgColor: "bg-stone-200",
        darkBgColor: "dark:bg-stone-800",
        yRange: ['-8rem', '0rem'],
        className: "flex items-center justify-center",
        variant: variant,
      }
    },
    {
      Component: WorkGraphicSection,
      props: {
        key: 'work',
        as: "section",
        bgColor: "bg-gray-300",
        darkBgColor: "dark:bg-gray-700",
        yRange: ['16rem', '0rem'],
        className: "flex items-center justify-center text-black dark:text-white",
      }
    }
  ] as const;

  return (
    <>
      {sections.map(({ Component, props }, index) => {
        const previousSection = index > 0 ? sections[index - 1] : null;

        const wrapperProps = {
          wrapperBgColor: previousSection ? previousSection.props.bgColor : "bg-[#F5F5EF]",
          darkWrapperBgColor: previousSection ? previousSection.props.darkBgColor : "dark:bg-[#2F2F2B]",
        };
        
        const { key, ...restOfProps } = props;
        
        return <Component key={key} {...restOfProps} {...wrapperProps} />;
      })}
    </>
  );
};