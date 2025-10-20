import "./(portfolio)/globals.css";

import { Figtree } from "next/font/google";
import { ProgressBar } from "@/components/ProgressBar";

const figtree = Figtree({
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '700']
});

// This RootLayout will wrap the not-found.tsx page
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F5F5EF] dark:bg-[#2F2F2B]" suppressHydrationWarning>
      <body className={`h-full ${figtree.className}`} suppressHydrationWarning>
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}