import { createClient } from "next-sanity";

import { getApiVersion, getProjectId, getDataset, getStudioPath } from '@/sanity/env';
const apiVersion = getApiVersion();
const studioUrl = getStudioPath();
const projectId = getProjectId();
const dataset = getDataset();

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // `true` for production, `false` for development/drafts
  perspective: 'published',
  stega: {
    enabled: false,
    studioUrl,
  },
});