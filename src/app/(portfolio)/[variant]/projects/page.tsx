type Props = {
  params: { variant: 'tim' | 'tiger' };
};

export default async function ProjectsPage({ params }: Props) {
  const { variant } = await params;

  return (
    <main className="h-full content-center text-center">
      <h1>All Projects ({variant})</h1>
    </main>
  );
}