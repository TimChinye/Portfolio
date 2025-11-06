type Props = {
  params: { variant: 'tim' | 'tiger' };
};

export default async function ContactPage({ params }: Props) {
  const { variant } = await params;

  return (
    <main className="h-full content-center text-center">
      <h1>Contact Page ({variant})</h1>
    </main>
  );
}