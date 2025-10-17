import { type SchemaTypeDefinition } from 'sanity';

import { blockContentType } from './objects/blockContent';

import { globalContent } from './singletons/globalContent';
import { projectContent } from './documents/projectContent';
import { pageHome } from './singletons/pageHome';
import { pageAbout } from './singletons/pageAbout';
import { pageProjects } from './singletons/pageProjects';
import { pageContact } from './singletons/pageContact';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ blockContentType, globalContent, projectContent, pageAbout, pageContact, pageHome, pageProjects ],
}