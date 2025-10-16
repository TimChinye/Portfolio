import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, getStudioPath } from '@/sanity/env';
const studioUrl = getStudioPath();

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // `true` for production, `false` for development/drafts
  stega: {
    // stega is enabled by default in Live Mode
    enabled: false,
    studioUrl,
  },
});