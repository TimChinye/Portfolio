import { client } from "@/sanity/lib/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { getDraftModeSecret } from '@/sanity/env';
const token = getDraftModeSecret();

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});