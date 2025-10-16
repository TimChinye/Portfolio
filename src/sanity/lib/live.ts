import { defineLive } from "next-sanity/live";
import { client } from './client';

import { getDraftModeSecret } from '@/sanity/env';
const token = getDraftModeSecret();

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
