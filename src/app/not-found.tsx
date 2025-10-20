// src/app/not-found.tsx
import "./(portfolio)/globals.css";

import { getNotFoundPage } from '@/sanity/lib/queries';
import { Figtree } from "next/font/google";
import NotFoundClient from "./NotFoundClient"; // Import the new client component

const figtree = Figtree({
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '700']
});

// This Server Component now only handles data fetching and the root HTML structure.
export default async function NotFound() {
  const content = await getNotFoundPage();
  
  return (
    <html lang="en" className="h-full bg-[#F5F5EF] dark:bg-[#2F2F2B]" suppressHydrationWarning>
      <body className={`h-full ${figtree.className}`} suppressHydrationWarning>
        <NotFoundClient content={content} />
      </body>
    </html>
  );
}