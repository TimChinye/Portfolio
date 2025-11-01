// src/components/CustomLink.tsx
"use client";

// --- START: Updated import to include AnchorHTMLAttributes ---
import { forwardRef, type AnchorHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { progressBarEvents } from '../features/ProgressBar/events';
import { getPageIndex, type NavigationDirection } from '../shared/Navbar/config';

// --- START: Simplified and corrected props type ---
// This now correctly inherits all standard `<a>` tag attributes like
// onMouseEnter, onMouseLeave, onFocus, style, etc., in addition to Next.js's LinkProps.
type CustomLinkProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;
// --- END: Change ---

const CustomLinkComponent = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ href, children, ...props }, ref) => {
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If the original onClick prop exists, call it first.
      if (props.onClick) {
        props.onClick(e);
      }
      
      const currentPath = pathname;
      const newPath = href.toString();

      // Don't trigger the progress bar for external links or same-page links.
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