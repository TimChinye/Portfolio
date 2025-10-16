﻿import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'

export const projectType = defineType({
  name: 'project',
  title: 'Projects',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'visibility',
      title: 'Visibility',
      description: "Choose which persona(s) can see this project.",
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Tim Chinye', value: 'tim'},
          {title: 'Tiger', value: 'tiger'},
        ],
        layout: 'grid',
      },
      validation: (Rule) => Rule.required().min(1),
    }),

    // --- Content for Homepage Hero Popup ---
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      description: "Image used for the homepage's interactive hero graphic.",
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description (~10 words)',
      description: 'Used in the homepage hero popup.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'techDescription',
      title: 'Technology Description',
      description: 'The "Core Technologies" and "Libraries" text for the hero popup.',
      type: 'text',
    }),

    // --- Content for Homepage Featured Section ---
    defineField({
      name: 'featuredDescription',
      title: 'Featured Description',
      description: 'The longer description used in the "Featured Projects" section of the homepage.',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),

    // --- Content for /projects Page ---
    defineField({
      name: 'isHighlighted',
      title: 'Highlighted Project?',
      description: 'Enable this to feature the project at the top of the /projects page.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'yearCompleted',
      title: 'Year Completed',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(2010).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: 'isNew',
      title: 'Mark as "New"?',
      description: 'Displays a "New" tag next to the project on the /projects page.',
      type: 'boolean',
      initialValue: false,
    }),

    // --- CTAs (Call to Actions) ---
    defineField({
      name: 'ctaPrimary',
      title: 'Primary CTA',
      type: 'object',
      fields: [
        {name: 'label', title: 'Button Label', type: 'string', validation: (Rule) => Rule.required()},
        {name: 'url', title: 'URL (External or Internal)', type: 'string', validation: (Rule) => Rule.required()},
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaSecondary',
      title: 'Secondary CTA (Optional)',
      type: 'object',
      fields: [
        {name: 'label', title: 'Button Label', type: 'string'},
        {name: 'url', title: 'URL (External or Internal)', type: 'string'},
      ],
    }),
    defineField({
      name: 'ctaTextLink',
      title: 'Text Link CTA (Optional)',
      type: 'object',
      fields: [
        {name: 'label', title: 'Link Label', type: 'string'},
        {name: 'url', title: 'URL (External or Internal)', type: 'string'},
      ],
    }),

    // --- Case Study Content ---
    defineField({
      name: 'caseStudyContent',
      title: 'Case Study Content',
      description: 'The full, unique case study for the project focus page (/project/[slug]).',
      type: 'blockContent', // This references blockContentType.ts
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      visibility: 'visibility',
    },
    prepare({title, media, visibility}) {
      const personas = (visibility || []).join(', ').replace('tim', 'Tim').replace('tiger', 'Tiger')
      return {
        title: title,
        subtitle: `Visible to: ${personas || 'None'}`,
        media: media,
      }
    },
  },
})