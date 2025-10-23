// src/app/(portfolio)/[variant]/_components/FeaturedProjectsSection.tsx

type Props = {
  variant: 'tim' | 'tiger';
};

export const FeaturedProjectsSection = async ({ variant }: Props) => {
  // TODO: Fetch 3 featured projects from Sanity, filtered by the current variant.
  const projects = [
    { id: 1, title: 'Project Alpha' },
    { id: 2, title: 'Project Beta' },
    { id: 3, title: 'Project Gamma' },
  ];

  return (
    <section className="py-24 px-4 bg-gray-100 dark:bg-gray-800">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Featured Projects</h2>
        <p>A selection of recent work ({variant} variant).</p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="border p-4 rounded-lg">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            {/* Project thumbnail and description would go here */}
          </div>
        ))}
      </div>
    </section>
  );
};