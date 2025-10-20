// src/app/(portfolio)/[variant]/about/page.tsx
// src/app/(portfolio)/[variant]/about/page.tsx
import { notFound } from 'next/navigation';

type Props = {
  params: { variant: 'tim' | 'tiger' };
};

export default async function AboutPage({ params }: Props) {
  const { variant } = await params;

  // As per the specification, the About page is only for the 'tim' variant.
  // The notFound() function will render the closest not-found.tsx file.
  if (variant === 'tiger') {
    notFound();
  }

  // TODO: Fetch 'pageAbout' content from Sanity here.

  return (
    <main>
      <h1>About Page</h1>
      <p>This page is only visible for the &apos;tim&apos; variant.</p>
      {/* Rest of the page content will go here */}
    </main>
  );
}