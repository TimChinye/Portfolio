// src/app/(portfolio)/[variant]/_components/AboutSection.tsx

type Props = {
  variant: 'tim' | 'tiger';
};

export const AboutSection = async ({ variant }: Props) => {
  // TODO: Fetch variant-specific "About Me" text from Sanity ('timHomepageAboutText')
  const aboutText =
    variant === 'tim'
      ? 'This is the about section, visible only to the "tim" variant. Content will be fetched from Sanity.'
      : '';

  if (variant === 'tiger') {
    return null; // Per the spec, this section is only for the 'tim' variant.
  }

  return (
    <section className="py-24 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">About Me</h2>
      <p className="max-w-2xl mx-auto">{aboutText}</p>
      {/* TODO: Add video component here ('timHomepageAboutVideo') */}
    </section>
  );
};