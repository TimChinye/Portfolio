import {defineField, defineType} from 'sanity';
import { DocumentIcon } from '@sanity/icons';

export const pageAbout = defineType({
  name: 'pageAbout',
  title: 'About Page',
  type: 'document',
  icon: DocumentIcon,
  preview: { prepare: () => ({ title: 'About Page' }) },

  // === Groups / Tabs ===

  groups: [
    { name: 'default', title: 'Default Content', default: true },
    { name: 'tim', title: 'Tim Chinye Content' },
    { name: 'tiger', title: 'Tiger Content' },
  ],

  fields: [
    defineField({
      name: 'topParagraph',
      title: 'Top Paragraph',
      description: 'The first block of text that appears above the video.',
      type: 'text',
      rows: 3,
      group: 'tim',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bottomParagraph',
      title: 'Bottom Paragraph',
      description: 'The second block of text that appears below the video.',
      type: 'text',
      rows: 3,
      group: 'tim',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'journeyButtonText',
      title: 'Journey Button Text',
      description: 'The text for the button that links to the /about page.',
      type: 'string',
      initialValue: 'My Journey',
      group: 'tim',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundVideo',
      title: 'Background Video',
      description: 'The looping video behind the "My Journey" button.',
      type: 'mux.video',
      group: 'tim',
      validation: (Rule) => Rule.required(),
    }),
  ],
});