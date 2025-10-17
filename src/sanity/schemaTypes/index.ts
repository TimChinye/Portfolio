import { type SchemaTypeDefinition } from 'sanity'

import { blockContentType } from './objects/blockContent'

import { globalContent } from './singletons/globalContent';
import { projectContent } from './documents/projectContent';
import { pageAbout } from './singletons/pageAbout';
import { pageContact } from './singletons/pageContact';
import { pageHome } from './singletons/pageHome';
import { pageProjects } from './singletons/pageProjects';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ blockContentType, globalContent, projectContent, pageAbout, pageContact, pageHome, pageProjects ],
}