import {defineField, defineType} from 'sanity';
import { DocumentIcon } from '@sanity/icons';

export const globalContent = defineType({
  name: 'globalContent',
  title: 'Global Content',
  type: 'document',
  icon: DocumentIcon,
  preview: { prepare: () => ({ title: 'Global Content' }) },

  // === Groups / Tabs ===
  groups: [
    {name: 'default', title: 'Default Content', default: true},
    {name: 'tim', title: 'Tim Chinye Content'},
    {name: 'tiger', title: 'Tiger Content'},
  ],

  fields: [
    // === Group: Default ===
    defineField({
      name: 'siteUrl',
      title: 'Canonical Site URL',
      description: 'The primary, canonical URL of the site.',
      type: 'url',
      group: 'default',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultSeoTitle',
      title: 'SEO Title',
      description: 'A fallback title for pages that do not have their own.',
      type: 'string',
      group: 'default',
    }),
    defineField({
      name: 'defaultSeoDescription',
      title: 'SEO Description',
      description: 'A fallback description for search engines.',
      type: 'text',
      group: 'default',
    }),

    // === Group: Tim ===
    defineField({
      name: 'timHeroName',
      title: 'Homepage Hero Name (Tim)',
      type: 'string',
      group: 'tim',
      initialValue: 'Tim Chinye',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timHeroBio',
      title: 'Homepage Hero Bio (Tim)',
      description: `The short text underneath the name.`,
      type: 'string',
      group: 'tim',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timHomepageAboutText',
      title: 'Homepage "About Me" Text (Tim)',
      type: 'text',
      group: 'tim',
      validation: (Rule) => Rule.required(),
    }),
     defineField({
      name: 'timHomepageAboutVideo',
      title: 'Homepage "About Me" Video (Tim)',
      description: 'This is where you will upload the video for the about me section.',
      type: 'file', // Or use 'mux.video' if you set up the Mux plugin
      group: 'tim',
    }),
    defineField({
      name: 'timFooterLinks',
      title: 'Footer Links (Tim)',
      type: 'array',
      group: 'tim',
      of: [{type: 'object', fields: [
        defineField({name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required()}),
        defineField({name: 'url', type: 'string', title: 'URL', validation: (Rule) => Rule.required()}),
      ]}],
    }),
    defineField({
      name: 'timContactEmail',
      title: 'Contact Form Recipient (Tim)',
      type: 'string',
      group: 'tim',
      validation: (Rule) => Rule.email().required(),
    }),

    // === Group: Tiger ===
    defineField({
      name: 'tigerHeroName',
      title: 'Homepage Hero Name (Tiger)',
      type: 'string',
      group: 'tiger',
      initialValue: 'Tiger',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tigerHeroBio',
      title: 'Homepage Hero Bio (Tiger)',
      description: `The short text underneath the name.`,
      type: 'string',
      group: 'tiger',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tigerFooterLinks',
      title: 'Footer Links (Tiger)',
      type: 'array',
      group: 'tiger',
      of: [{type: 'object', fields: [
        defineField({name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required()}),
        defineField({name: 'url', type: 'string', title: 'URL', validation: (Rule) => Rule.required()}),
      ]}],
    }),
    defineField({
      name: 'tigerContactEmail',
      title: 'Contact Form Recipient (Tiger)',
      type: 'string',
      group: 'tiger',
      validation: (Rule) => Rule.email().required(),
    }),
  ],
});