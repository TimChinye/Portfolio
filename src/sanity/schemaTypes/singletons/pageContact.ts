import { defineField, defineType } from 'sanity';
import { DocumentIcon } from '@sanity/icons';

/* =========================================================================
   1. REUSABLE FIELD DEFINITIONS
   (We define these as arrays of fields, not types, to inline them safely)
   ========================================================================= */

const themeQrCodeFields = [
  defineField({ 
    name: 'light', 
    title: 'Light Mode QR (Dark pixels on Light bg)', 
    type: 'image' 
  }),
  defineField({ 
    name: 'dark', 
    title: 'Dark Mode QR (Light pixels on Dark bg)', 
    type: 'image' 
  }),
];

/* =========================================================================
   2. HELPER FUNCTION
   ========================================================================= */

const createVariantFields = (prefix: string, title: string) => [
  defineField({
    name: `${prefix}ContactMethods`,
    title: `Contact Methods (${title})`,
    type: 'array',
    group: prefix,
    of: [
      // Single Link Object
      {
        type: 'object',
        name: 'singleLink', // Internal name for the array item
        title: 'Single Link Button',
        fields: [
          defineField({ name: 'label', type: 'string', title: 'Label' }),
          defineField({ name: 'url', type: 'url', title: 'URL', validation: Rule => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel', 'sms'] }) }),
          defineField({ 
            name: 'qrCode', 
            title: 'Hover QR Code', 
            type: 'object', 
            fields: themeQrCodeFields 
          }),
        ],
        preview: {
          select: { title: 'label', subtitle: 'url' }
        }
      },
      // Split Link Object
      {
        type: 'object',
        name: 'splitLink',
        title: 'Split Link Button',
        fields: [
          // Left
          defineField({ name: 'leftLabel', type: 'string', title: 'Left Label' }),
          defineField({ name: 'leftUrl', type: 'url', title: 'Left URL', validation: Rule => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel', 'sms'] }) }),
          defineField({ 
            name: 'leftQrCode', 
            title: 'Left Hover QR Code', 
            type: 'object', 
            fields: themeQrCodeFields 
          }),
          // Right
          defineField({ name: 'rightLabel', type: 'string', title: 'Right Label' }),
          defineField({ name: 'rightUrl', type: 'url', title: 'Right URL', validation: Rule => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel', 'sms'] }) }),
          defineField({ 
            name: 'rightQrCode', 
            title: 'Right Hover QR Code', 
            type: 'object', 
            fields: themeQrCodeFields 
          }),
        ],
        preview: {
          select: { left: 'leftLabel', right: 'rightLabel' },
          prepare({ left, right }) {
            return { title: `${left || 'Left'} | ${right || 'Right'}` };
          }
        }
      },
    ],
  }),
  defineField({
    name: `${prefix}EmailAddress`,
    title: `Email Address (${title})`,
    type: 'string',
    group: prefix,
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: `${prefix}EmailQrCode`,
    title: `Email Hover QR Code (${title})`,
    type: 'object',
    group: prefix,
    fields: themeQrCodeFields,
  }),
];

/* =========================================================================
   3. MAIN DOCUMENT
   ========================================================================= */

export const pageContact = defineType({
  name: 'pageContact',
  title: 'Contact Page',
  type: 'document',
  icon: DocumentIcon,
  preview: { prepare: () => ({ title: 'Contact Page' }) },

  groups: [
    { name: 'default', title: 'Default / Shared', default: true },
    { name: 'tim', title: 'Tim Chinye Content' },
    { name: 'tiger', title: 'Tiger Content' },
  ],

  fields: [
    // === SHARED TITLES ===
    defineField({
      name: 'directTitle',
      title: 'Direct Contact Title',
      type: 'string',
      group: 'default',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'emailTitle',
      title: 'Email Section Title',
      type: 'string',
      group: 'default',
      validation: (Rule) => Rule.required(),
    }),

    // === TIM VARIANT ===
    ...createVariantFields('tim', 'Tim'),

    // === TIGER VARIANT ===
    ...createVariantFields('tiger', 'Tiger'),
  ],
});