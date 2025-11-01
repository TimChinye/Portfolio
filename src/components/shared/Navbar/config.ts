// src/components/Navbar/navConfig.ts
export const navLinks = [
  { href: '/about', key: 'about', label: 'About' },
  { href: '/projects', key: 'projects', label: 'Projects' },
  { href: '/contact', key: 'contact', label: 'Contact' },
] as const;

// This TypeScript magic infers the type directly from the array,
// ensuring the type is always perfectly in sync with the data.
export type NavLinkItem = typeof navLinks[number];

export const navRoutes = [
  { path: '/contact', index: 4 },
  { path: '/projects', index: 3 }, // Note: I swapped projects and project for a more logical flow
  { path: '/project', index: 2 }, // A single project is "deeper" than the list
  { path: '/about', index: 1 },
  { path: '/', index: 0 },
];

export type NavigationDirection = 'forward' | 'backward' | 'none';

export const getPageIndex = (path: string): number => {
  // Use startsWith to handle dynamic routes like /project/[slug]
  const matchedRoute = navRoutes.find(route => {
    // Handle the exact root path
    if (route.path === '/') return path === '/';
    return path.startsWith(route.path);
  });
  return matchedRoute ? matchedRoute.index : -1;
};