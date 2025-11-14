// src/components/Footer/index.tsx
import { getFooterData } from '@/sanity/lib/queries';
import { navLinks } from '../Navbar/config';
import { InteractiveLinkList } from '../../ui/InteractiveLinkList';
import { Section, type SectionProps } from '@/components/ui/Section';

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

type FooterProps = {
  variant: 'tim' | 'tiger';
} & SectionProps<'footer'>;

export const Footer = async ({ variant, ...props }: FooterProps) => {
  const data = await getFooterData(variant);
  const copyrightText = data?.copyrightText || 'ALL RIGHTS RESERVED → COPYRIGHT 2025 © ₮';
  const socialLinks = data?.socialLinks?.length ? data.socialLinks : fallbackSocialLinks;
  const links = variant === 'tiger'
  ? navLinks.filter((link) => link.key !== "about")
  : navLinks;
  const filteredNavLinks = links.map(link => ({
    ...link,
    label: navLinkLabelMap[link.key],
  }));
  
  return (
    <Section {...props}>
      <div className="w-fit inline-flex flex-col gap-8">
          <h2 className="text-[#2F2F2B] dark:text-[#D9D24D] font-newsreader text-5xl md:text-8xl">
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

      <div className="absolute inset-0 top-[auto] p-8 flex items-center justify-between flex-col md:flex-row">
        <InteractiveLinkList
          links={filteredNavLinks}
          listClassName="flex items-center gap-x-6 gap-y-2 text-lg text-[#2F2F2B] dark:text-[#D9D24D]"
        />
        <p className='text-xs md:text-sm md:text-[#2F2F2B] dark:md:text-[#D9D24D]'>
          {renderTextWithSpecialFormatting(copyrightText)}
        </p>
      </div>
    </Section>
  );
};