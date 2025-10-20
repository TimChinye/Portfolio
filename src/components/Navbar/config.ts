// src/components/Navbar/navConfig.ts
export const navLinks = [
  { href: '/about', key: 'about', label: 'About Me' },
  { href: '/projects', key: 'portfolio', label: 'Portfolio' },
  { href: '/contact', key: 'contact', label: 'Say Hello' },
] as const;

// This TypeScript magic infers the type directly from the array,
// ensuring the type is always perfectly in sync with the data.
export type NavLinkItem = typeof navLinks[number];