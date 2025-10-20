// src/components/ProgressBar/CustomLink.tsx
"use client";

import { forwardRef } from 'react';
import Link, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { progressBarEvents } from './events';
import { getPageIndex, type NavigationDirection } from '../Navbar/config';

type CustomLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

const CustomLinkComponent = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ href, children, ...props }, ref) => {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const currentPath = pathname;
    const newPath = href.toString();

    // Don't trigger for links to the same page or external links
    if (currentPath === newPath || !newPath.startsWith('/')) {
      return;
    }
    
    // Check if the original onClick prop exists and call it
    if (props.onClick) {
      props.onClick(e);
    }
    
      const prevIndex = getPageIndex(currentPath);
      const currentIndex = getPageIndex(newPath);
      let direction: NavigationDirection = 'none';

      if (prevIndex !== -1 && currentIndex !== -1 && prevIndex !== currentIndex) {
        direction = currentIndex > prevIndex ? 'forward' : 'backward';
      }
      
      progressBarEvents.emit('start', direction);
  };

  return (
      <Link ref={ref} href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
);

CustomLinkComponent.displayName = 'CustomLink';

export const CustomLink = CustomLinkComponent;