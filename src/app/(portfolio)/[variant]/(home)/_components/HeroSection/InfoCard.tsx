"use client";

import clsx from 'clsx';
import { motion, MotionStyle } from 'motion/react';
import { CustomLink as Link } from '@/components/ui/CustomLink';
import type { HeroProject } from '@/sanity/lib/queries';
import { ForwardedRef, forwardRef, useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const ExternalLinkIcon = () => (
  <span className="font-figtree -mt-1">
    ↗
  </span>
);

interface CtaButtonProps extends React.ComponentPropsWithoutRef<'a'> {
  href: string;
  variant: 'primary' | 'secondary';
  isExternal: boolean;
}
const CtaButton = forwardRef(function CtaButton(
  { href, variant, isExternal, children, ...props }: CtaButtonProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const commonClasses = "text-[1.25em] font-newsreader font-medium px-[1.5em] py-[0.75em] rounded-lg content-center";
  const hoverClasses = "transition-transform hover:-translate-y-1";
  
  const variantClasses = {
    primary: "bg-[#D9D24D] dark:bg-[#b5b03f] text-[#000000]",
    secondary: "bg-[#CCCCCC] dark:bg-[#AAAAAA] text-[#000000]"
  };

  const Component = isExternal ? 'a' : Link;

  return (
    <Component
      href={href}
      ref={ref}
      className={`${commonClasses} ${hoverClasses} ${variantClasses[variant]}`}
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}&nbsp;
      {isExternal && <ExternalLinkIcon />}
    </Component>
  );
});

type InfoCardProps = {
  project: HeroProject;
  onClose: () => void;
  className?: string;
  style?: MotionStyle;
};

export function InfoCard({ project, className, style }: InfoCardProps) {
  const isPrimaryExternal = !project.ctaPrimary?.url.startsWith('/');

  const [hasMounted, setHasMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const desktopAnimation = {
    initial: { opacity: 0, x: '100%', y: '0%' },
    animate: { opacity: 1, x: '0%', y: '0%' },
    exit: { opacity: 0, x: '-100%', y: '0%' },
  };

  const mobileAnimation = {
    initial: { opacity: 0, x: '0%', y: '100%' },
    animate: { opacity: 1, x: '0%', y: '0%' },
    exit: { opacity: 0, x: '0%', y: '-100%' },
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <motion.div
      {...(hasMounted ? (isMobile ? mobileAnimation : desktopAnimation) : desktopAnimation)}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={clsx(
        "rounded-xl md:rounded-r-none p-8 pb-4 md:p-16 md:pb-8 bg-[#F5F5EF]/50 dark:bg-[#2F2F2B]/50 shadow-[0.5rem_0.5rem_2rem_#0004] z-1000",
        "after:content-[''] after:absolute after:-inset-0.5 after:rounded-[inherit] after:backdrop-blur-lg after:-z-1",
        "flex flex-col gap-6 md:gap-8 text-start leading-none text-[#2F2F2B] dark:text-[#F5F5EF] max-md:text-[0.8125rem]",
        className
      )}
      style={style}
    >

      <div className="">
        <h3 className="text-[4em] font-newsreader dark leading-none tracking-tight">
          {project.title}
        </h3>
        <p className="text-[1em] font-figtree">
          {project.shortDescription}
        </p>
      </div>

      {project.techDescription && (
        <p className="text-[1.25em] font-figtree leading-tight dark whitespace-pre-line">
          {project.techDescription}
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          {project.ctaSecondary?.url && (
            <CtaButton href={project.ctaSecondary.url} variant="secondary" isExternal>
              {project.ctaSecondary.label}
            </CtaButton>
          )}

          {project.ctaPrimary && (
            <CtaButton href={isPrimaryExternal ? project.ctaPrimary.url : `/project/${project.slug.current}`} variant="primary" isExternal={isPrimaryExternal}>
              {project.ctaPrimary.label}
            </CtaButton>
          )}
        </div>

        {project.ctaTextLink?.url && (
          <a
            href={project.ctaTextLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[1em] font-newsreader transition-transform hover:translate-y-2 hover:scale-110"
          >
            {project.ctaTextLink.label}
            &nbsp;
            <ExternalLinkIcon />
          </a>
        )}
      </div>
    </motion.div>
  );
}