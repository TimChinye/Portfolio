// src/app/(portfolio)/[variant]/project/[slug]/page.tsx
type Props = {
  params: {
    variant: 'tim' | 'tiger';
    slug: string;
  };
};

export default async function ProjectPage({ params }: Props) {
  const { variant, slug } = await params;

  // TODO: Fetch a single project by its slug.
  // const project = await getProjectBySlug(slug);

  // If the project doesn't exist or is not visible for the current variant, show a 404 page.
  // if (!project || !project.visibility.includes(variant)) {
  //   notFound();
  // }

  return (
    <main className="h-full content-center text-center">
      <h1>Project: project.title ({variant})</h1>
      <p>Slug: {slug}</p>
      {/* The full case study content (Portable Text) will be rendered here */}
    </main>
  );
}