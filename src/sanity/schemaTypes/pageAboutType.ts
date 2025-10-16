import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const pageAboutType = defineType({
  name: 'pageAbout',
  title: 'About Page',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'motto',
      title: 'Motto',
      description: "The text that appears below your name in the hero section.",
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroLinks',
      title: 'Hero Links',
      description: 'The three links in the hero section.',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required()}),
        defineField({name: 'url', type: 'string', title: 'URL', validation: (Rule) => Rule.required()}),
      ]}],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'bioContent',
      title: 'Biographical Content',
      description: "The main body of text for the about page.",
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
  ],
})