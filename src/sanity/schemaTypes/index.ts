import { type SchemaTypeDefinition } from 'sanity'

import { siteSettings } from './siteSettings'

import { blockContentType } from './blockContentType'
import { projectType } from './projectType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ siteSettings, blockContentType, projectType ],
}