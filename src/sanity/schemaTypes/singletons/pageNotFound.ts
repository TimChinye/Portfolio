import {defineField, defineType} from 'sanity';
import { DocumentIcon } from '@sanity/icons';

export const pageNotFound = defineType({
  name: 'pageNotFound',
  title: '404 Page',
  type: 'document',
  icon: DocumentIcon,
  preview: { prepare: () => ({ title: '404 Page' }) },
  fields: [
    defineField({
      name: 'errorCode',
      title: 'Error Code',
      description: 'The bolded part of the title, e.g., "404."',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: '404.'
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message',
      description: 'The lighter part of the title, e.g., "Woops."',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'Woops.'
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      description: 'The descriptive text below the main title.',
      type: 'text',
      validation: (Rule) => Rule.required(),
      initialValue: "The page you are looking for doesn't exist"
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      description: 'The text for the link that returns to the homepage.',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'Go home'
    }),
  ],
});