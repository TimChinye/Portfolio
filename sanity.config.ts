'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { muxInput } from 'sanity-plugin-mux-input';
import { codeInput } from '@sanity/code-input';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';

import { schema } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

import { getApiVersion, getProjectId, getStudioPath, getDataset, getURL } from './src/sanity/env';
const defaultApiVersion = getApiVersion();
const projectId = getProjectId();
const basePath = getStudioPath();
const dataset = getDataset();
const origin = getURL();

import { PortfolioLogo } from './src/components/PortfolioLogo';

export default defineConfig({
  title: 'Portfolio\'s Content Editor',
  icon: PortfolioLogo,
  
  projectId,
  basePath,
  dataset,
  schema,

  plugins: [
    muxInput(),
    codeInput(),
    structureTool({ structure }),
    visionTool({ defaultApiVersion }),
    presentationTool({
      previewUrl: {
        origin,
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable'
        },
      }
    })
  ]
});