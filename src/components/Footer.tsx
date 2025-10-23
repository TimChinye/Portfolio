// src/components/shared/Footer.tsx
// NEW FILE

type Link = {
  label: string;
  url: string;
};

export const Footer = async ({
  variant
}: {
  variant: 'tim' | 'tiger';
}) => {
  console.log(variant);
  
  // TODO: Fetch variant-specific footer links from Sanity
  const links: Link[] =
    variant === 'tim'
      ? [
          { label: 'LinkedIn', url: '#' },
          { label: 'GitHub', url: '#' },
        ]
      : [
          { label: 'Twitter', url: '#' },
          { label: 'YouTube', url: '#' },
        ];

  return (
    <footer className="py-8 px-4 text-center border-t bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-center gap-8">
        {links.map((link) => (
          <a key={link.label} href={link.url} className="hover:underline">
            {link.label}
          </a>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        © {new Date().getFullYear()} {variant === 'tim' ? 'Tim Chinye' : 'Tiger'}. All Rights Reserved.
      </p>
    </footer>
  );
};