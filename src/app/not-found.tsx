import { getNotFoundPage } from '@/sanity/lib/queries';
import NotFoundClient from "./NotFoundClient";

export default async function NotFound() {
  const content = await getNotFoundPage();
  
  return <NotFoundClient content={content} />;
}