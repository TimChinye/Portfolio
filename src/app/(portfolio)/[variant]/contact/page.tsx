import { Section } from '@/components/ui/Section';
import { ContactOptions } from './_components/options';
import { ContactHeroSection } from './_components/hero';
import { ContactFormSection } from './_components/form';
import { GetInTouchSection } from './_components/getInTouch';
import { getContactPageData } from '@/sanity/lib/queries';

type Props = {
  params: Promise<{ variant: 'tim' | 'tiger' }>;
};

export default async function ContactPage({ params }: Props) {
  const { variant } = await params;
  
  // Fetch data
  const data = await getContactPageData(variant);

  if (!data) {
    return (
      <>
        <ContactHeroSection variant={variant} />
        <Section bgClasses="bg-transparent" className="p-24 rounded-none text-center content-center" wrapperClassName="m-0">
          <p>There's no data from Sanity Studio coming through.</p>
        </Section>
      </>
    )
  }

  return (
    <>
      <ContactHeroSection variant={variant} />
      
      {/* 1. Contact Options (Pills) */}
      <ContactOptions data={data} />

      {/* 2. Main Content Grid */}
      <ContactFormSection variant={variant} />
      
      <GetInTouchSection
        key="get-in-touch"
        bgClasses="bg-[#EFEFD0] dark:bg-[#2F2F2B]"
        className="flex items-center justify-center h-[75vh]"
        animationRange={["start 0.5", "end 0.75"]}
        fillScreen={false}
      />
    </>
  );
}