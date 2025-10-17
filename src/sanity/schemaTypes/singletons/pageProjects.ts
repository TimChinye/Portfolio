import {defineField, defineType} from 'sanity';
import { DocumentIcon } from '@sanity/icons';

export const pageProjects = defineType({
  name: 'pageProjects',
  title: 'Projects Page',
  type: 'document',
  icon: DocumentIcon,
  preview: { prepare: (_, ) => ({ title: 'Projects Page' }) },

  // === Groups / Tabs ===
  groups: [
    { name: 'default', title: 'Default Content', default: true },
    { name: 'tim', title: 'Tim Chinye Content' },
    { name: 'tiger', title: 'Tiger Content' },
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
});