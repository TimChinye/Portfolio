// src/app/(portfolio)/[variant]/projects/page.tsx

type Props = {
  params: { variant: 'tim' | 'tiger' };
};

export default async function ProjectsPage({ params }: Props) {
  const { variant } = await params;

  // TODO: Fetch all projects from Sanity where 'visibility' includes the current variant.
  // const projects = await getAllProjects(variant);

  return (
    <main>
      <h1>All Projects ({variant})</h1>
      {/* Map over the fetched projects and render them here */}
    </main>
  );
}