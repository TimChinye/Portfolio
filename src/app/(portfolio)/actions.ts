'use server'

import { draftMode } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function disableDraftMode() {
  // Disable draft mode by clearing the cookie
  (await draftMode()).disable();
  
  // Revalidate the entire site to ensure the user sees the published content
  revalidateTag('sanity');
}