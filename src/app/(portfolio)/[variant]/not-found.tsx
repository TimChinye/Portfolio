// src/app/(portfolio)/[variant]/not-found.tsx
import Link from 'next/link';

// This component receives no props.
// Next.js automatically passes the correct variant in the URL for the links.
export default function NotFound() {
  return (
    <div className="text-center p-4" >
      <h1>404 - Page Not Found</h1>
      <p>It seems you've taken a path that doesn't exist... yet.</p>
      <div className="flex gap-4 justify-center mt-8">
        <Link href="/">Return to the Homepage</Link>
        <Link href="/projects">View All Projects</Link>
        <Link href="/contact">Contact Me</Link>
      </div>
    </div>
  );
}