import { getFooterData } from '@/sanity/lib/queries';
import { Section } from '@/components/Section';
import { navLinks } from '../Navbar/config';
import { InteractiveLinkList } from '../InteractiveLinkList';

const specialCharMap: Record<string, (key: string | number) => React.ReactNode> = {
  '→': (key) => <span key={key} className="align-text-bottom">&nbsp;→&nbsp;</span>,
  '₮': (key) => <span key={key} className='align-middle text-[1.5em]'>₮</span>,
};

export const renderTextWithSpecialFormatting = (text: string): React.ReactNode[] => {
  const regex = new RegExp(`(${Object.keys(specialCharMap).join('|')})`);
  const parts = text.split(regex);

  return parts.filter(part => part)
    .map((part, index) => {
      const replacer = specialCharMap[part];
      return replacer ? replacer(index) : part;
    });
};

const navLinkLabelMap = {
  about: 'ABOUT ME',
  projects: 'MY WORK',
  contact: 'CONTACT',
} as const;

const fallbackSocialLinks = [
  { label: 'CODEPEN', href: '#' },
  { label: 'GITHUB', href: '#' },
  { label: 'LINKEDIN', href: '#' },
];

export const Footer = async ({
  variant
}: {
  variant: 'tim' | 'tiger';
}) => {
  const data = await getFooterData(variant);
  const copyrightText = data?.copyrightText || 'ALL RIGHTS RESERVED → COPYRIGHT 2025 © ₮';
  const socialLinks = data?.socialLinks?.length ? data.socialLinks : fallbackSocialLinks;

  const links = variant === "tiger"
  ? navLinks.filter((link) => link.key !== "about")
  : navLinks;
  
  const filteredNavLinks = links.map(link => ({
    ...link,
    label: navLinkLabelMap[link.key],
  }));

  return (
    // pt-32 -top-32
    <footer className="pt-32 -top-64 relative h-screen bg-[#E9E8B1] dark:bg-[#2F2F2B] text-[#7A751A] dark:text-[#F5F5EF] font-medium rounded-t-[6rem] md:rounded-t-[8rem] content-center text-center">
      <div className="w-fit inline-flex flex-col gap-8">
          <h2 className="text-[#2F2F2B] dark:text-[#D9D24D] font-newsreader text-5xl md:text-8xl">
            {/* Don't be a stranger */}
            Don&apos;t&nbsp;
            <b>be</b>&nbsp;
            <i>a</i>&nbsp;
            <u className="relative no-underline before:content-[''] before:z-0 before:absolute before:bg-[currentColor] after:content-[''] after:z-0 after:absolute after:bg-[currentColor] before:h-[0.1lh] before:inset-[auto_2.5ch_0.1lh_0] after:h-[4.9px] after:inset-[auto_0_0.1lh_4.75ch] md:before:h-[0.1lh] md:before:inset-[auto_2.5ch_0.1lh_0] md:after:h-[0.1lh] md:after:inset-[auto_0_0.1lh_4.75ch]">stranger</u>
          </h2>
          <InteractiveLinkList
            links={socialLinks}
            listClassName="flex flex-col md:flex-row justify-center items-center gap-x-12 gap-y-4"
          />
      </div>

      <div className="absolute inset-0 top-[auto] p-8 flex items-center justify-between max-md:text-[#D9D24D] flex-col md:flex-row">
        <InteractiveLinkList
          links={filteredNavLinks}
          listClassName="flex items-center gap-x-6 gap-y-2 text-lg"
        />
        <p className='text-xs md:text-sm'>
          {renderTextWithSpecialFormatting(copyrightText)}
        </p>
      </div>
    </footer>
  );
};