// src/components/InteractiveLinkList.tsx
// NEW FILE
"use client";

import { useState }from 'react';
import { CustomLink as Link }from '@/components/CustomLink';
import { motion }from 'motion/react';

type LinkItem = {
  label: string;
  href: string;
  key?: string; // Optional key for more stable hover state
};

type InteractiveLinkListProps = {
  links: readonly LinkItem[];
  listClassName?: string;
  listItemClassName?: string;
  linkClassName?: string;
  strikethroughClassName?: string;
};

export function InteractiveLinkList({
  links,
  listClassName = '',
  listItemClassName = '',
  linkClassName = '',
  strikethroughClassName = 'bg-current',
}: InteractiveLinkListProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <ul
      className={listClassName}
      onMouseLeave={() => setHoveredLink(null)}
    >
      {links.map((link) => {
        const linkKey = link.key || link.label;
        const isAnotherLinkHovered = hoveredLink !== null && hoveredLink !== linkKey;

        return (
          <li
            key={linkKey}
            className={`relative ${listItemClassName}`}
            onMouseEnter={() => setHoveredLink(linkKey)}
          >
            <Link
              href={link.href}
              className={`transition-opacity duration-300 ${linkClassName}`}
              style={{ opacity: isAnotherLinkHovered ? 0.25 : 1 }}
            >
              {link.label}
            </Link>
            <motion.span
              className={`absolute top-1/2 left-0 h-px w-full ${strikethroughClassName}`}
              style={{ y: '-50%', originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isAnotherLinkHovered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </li>
        );
      })}
    </ul>
  );
}