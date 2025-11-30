export const navLinks = [
  { href: '/about', key: 'about', label: 'About' },
  { href: '/projects', key: 'projects', label: 'Projects' },
  { href: '/contact', key: 'contact', label: 'Contact' },
] as const;

// Make the type always perfectly sync with the array's data.
export type NavLinkItem = typeof navLinks[number];

export const navRoutes = [
  { path: '/contact', index: 4 },
  { path: '/projects', index: 3 },
  { path: '/project', index: 2 },
  { path: '/about', index: 1 },
  { path: '/', index: 0 },
];

export type NavigationDirection = 'forward' | 'backward' | 'none';

export const getPageIndex = (path: string): number => {
  const matchedRoute = navRoutes.find(route => {
    if (route.path === '/') return path === '/';
    return path.startsWith(route.path);
  });
  return matchedRoute ? matchedRoute.index : -1;
};