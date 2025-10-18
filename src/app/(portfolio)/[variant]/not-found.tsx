// src/app/(portfolio)/[variant]/not-found.tsx
import Link from 'next/link';

// This component receives no props.
// Next.js automatically passes the correct variant in the URL for the links.
export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>It seems you've taken a path that doesn't exist... yet.</p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/">Return to the Homepage</Link>
        <Link href="/projects">View All Projects</Link>
        <Link href="/contact">Contact Me</Link>
      </div>
    </div>
  );
}