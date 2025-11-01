import { getNotFoundPage } from '@/sanity/lib/queries';

import { CursorTrail } from "@/components/ui/CursorTrail";
import { CustomLink as Link } from "@/components/ui/CustomLink";

import { PageTransition } from '@/components/features/PageTransition';
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";

interface NotFoundPageData {
  errorCode: string;
  errorMessage: string;
  subheading: string;
  buttonText: string;
}

export default async function NotFound() {
  const content: NotFoundPageData | null = await getNotFoundPage();
  
  // Fallback content if Sanity fetch fails
  const errorCode = content?.errorCode || '404.';
  const errorMessage = content?.errorMessage || 'Woops.';
  const subheading = content?.subheading || "The page you are looking for doesn't exist";
  const buttonText = content?.buttonText || 'Go home';
  
  return (
    <PageTransition isNotFound>
      <CursorTrail />
      <main className="h-full flex flex-col justify-center items-center gap-8">
        <PortfolioIcon className="size-16 text-black dark:text-white" />
        <h1 className="text-6xl font-bold">
          <span className="text-black dark:text-white">{errorCode}</span>{' '}
          <span className="font-light text-black-500 dark:text-black-400">{errorMessage}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {subheading}
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-4 rounded-full border-2 border-black text-black font-bold transition hover:-translate-y-1 dark:border-white dark:text-white relative before:absolute before:content-[''] before:-inset-4 hover:before:-bottom-5"
        >
          {buttonText}
        </Link>
      </main>
    </PageTransition>
  );
}