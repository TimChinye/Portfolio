// src/app/(portfolio)/[variant]/contact/page.tsx

type Props = {
  params: { variant: 'tim' | 'tiger' };
};

export default async function ContactPage({ params }: Props) {
  const { variant } = await params;

  // TODO: Fetch 'pageContact' content from Sanity.

  return (
    <main>
      <h1>Contact Page ({variant})</h1>
      {/* The puzzle-style contact form component will go here */}
    </main>
  );
}