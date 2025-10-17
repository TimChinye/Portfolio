'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { codeInput } from '@sanity/code-input'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'

import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { getApiVersion, getProjectId, getStudioPath, getDataset } from './src/sanity/env';
const defaultApiVersion = getApiVersion();
const projectId = getProjectId();
const basePath = getStudioPath();
const dataset = getDataset();

import { PortfolioLogo } from './src/components/PortfolioLogo';

export default defineConfig({
  title: 'Portfolio\'s Content Editor',
  icon: PortfolioLogo,
  
  projectId,
  basePath,
  dataset,
  schema,

  plugins: [
    codeInput(),
    structureTool({ structure }),
    visionTool({ defaultApiVersion }),
    presentationTool({
      previewUrl: {
        origin: 'http://localhost:3000', // Replace with deployment URL in production
        preview: '/', // Default preview path
        previewMode: {
          enable: '/api/draft-mode/enable'
        },
      }
    })
  ]
})
