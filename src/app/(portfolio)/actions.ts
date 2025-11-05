'use server'

import { draftMode } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function disableDraftMode() {
  // Disable draft mode by clearing the cookie
  (await draftMode()).disable();
  
  // Revalidate the entire site starting from the root layout
  revalidatePath('/', 'layout'); 
}