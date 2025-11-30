"use client";

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { progressBarEvents } from '../features/ProgressBar/events';
import { getPageIndex, type NavigationDirection } from '../shared/Navbar/config';

type CustomLinkProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;

const CustomLinkComponent = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ href, children, ...props }, ref) => {
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (props.onClick) {
        props.onClick(e);
      }
      
      const currentPath = pathname;
      const newPath = href.toString();

      // Ignore external/same-page links
      if (currentPath === newPath || !newPath.startsWith('/')) {
        return;
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