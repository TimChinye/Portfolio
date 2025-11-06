type Props = {
  params: {
    variant: 'tim' | 'tiger';
    slug: string;
  };
};

export default async function ProjectPage({ params }: Props) {
  const { variant, slug } = await params;

  return (
    <main className="h-full content-center text-center">
      <h1>Project: project.title ({variant})</h1>
      <p>Slug: {slug}</p>
    </main>
  );
}