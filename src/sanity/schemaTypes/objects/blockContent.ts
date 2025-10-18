// src/sanity/schemaTypes/objects/blockContent.ts

import { defineField, defineType, defineArrayMember } from 'sanity';
import { PlayIcon, CodeIcon, ImageIcon } from '@sanity/icons';

/**
 * This is the schema definition for the rich text fields used for
 * case study content. This has been enhanced to include custom components.
 */
export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    // --- Default Rich Text Block ---
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'H5', value: 'h5' },
        { title: 'H6', value: 'h6' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            title: 'URL',
            type: 'object',
            fields: [
              defineField({
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel'],
                    allowRelative: true,
                  }),
              }),
              defineField({
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean',
                initialValue: true,
              }),
            ],
          },
        ],
      },
    }),

    // --- Custom Image Block ---
    defineArrayMember({
      name: 'image',
      title: 'Image',
      type: 'image',
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        // --- Core Content ---
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Required for all non-decorative images.',
          validation: (Rule) => Rule.custom((alt, context) => {
            if ((context.parent as { isDecorative?: boolean })?.isDecorative) {
              return true;
            }
            return alt ? true : 'Alt text is required for non-decorative images.';
          }),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption displayed below the image.',
        }),

        // --- Layout & Styling ---
        defineField({
          name: 'layout',
          title: 'Layout',
          type: 'string',
          description: 'How the image is displayed in the content flow.',
          options: {
            list: [
              { title: 'Contained', value: 'contained' },
              { title: 'Full Width', value: 'full' },
              { title: 'Float Left', value: 'floatLeft' },
              { title: 'Float Right', value: 'floatRight' },
            ],
            layout: 'radio',
          },
          initialValue: 'contained',
        }),

        // --- Interactivity & Accessibility ---
        defineField({
          name: 'link',
          title: 'Image Link',
          type: 'object',
          description: 'Make the image a clickable link.',
          fields: [
            defineField({
              title: 'URL',
              name: 'href',
              type: 'url',
            }),
            defineField({
              title: 'Open in new tab',
              name: 'blank',
              type: 'boolean',
              initialValue: true,
            }),
          ],
        }),
        defineField({
          name: 'isDecorative',
          title: 'Decorative Image',
          type: 'boolean',
          description: 'Enable if the image adds no informational value.',
          initialValue: false,
        }),
      ],
      preview: {
        select: {
          media: 'asset',
          title: 'caption',
          alt: 'alt',
        },
        prepare({ media, title, alt }) {
          return {
            title: title || 'Image',
            subtitle: alt || '(No alt text)',
            media: media,
          };
        },
      },
    }),

    // --- Custom Mux Video Block ---
    defineArrayMember({
      name: 'muxVideo',
      title: 'Mux Video',
      type: 'object',
      icon: PlayIcon,
      fields: [
        // --- Core Content ---
        defineField({
          name: 'video',
          title: 'Video File',
          type: 'mux.video',
          description: 'Upload video file here. Add a custom thumbnail via the "Poster" field.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Accessible Title',
          type: 'string',
          description: 'A concise title for the video for screen readers.',
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
          description: 'Optional caption displayed below the video.',
        }),

        // --- Layout & Playback ---
        defineField({
          name: 'layout',
          title: 'Layout',
          type: 'string',
          options: { list: [{ title: 'Contained', value: 'contained' }, { title: 'Full Width', value: 'full' }], layout: 'radio' },
          initialValue: 'contained',
        }),
        defineField({
          name: 'autoplay',
          title: 'Autoplay',
          type: 'boolean',
          description: 'Note: Requires video to be muted in most browsers.',
          initialValue: false,
        }),
        defineField({
          name: 'muted',
          title: 'Muted',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'loop',
          title: 'Loop',
          type: 'boolean',
          initialValue: false,
        }),
      ],
      preview: {
        select: {
          title: 'title',
          caption: 'caption',
          playbackId: 'video.asset.playbackId',
        },
        prepare({ title, caption, playbackId }) {
          const subtitle = playbackId ? 'Video Uploaded' : 'No video uploaded';
          return {
            title: title || caption || 'Mux Video',
            subtitle: subtitle,
            media: PlayIcon,
          };
        },
      },
    }),

    // --- Custom MDX Block ---
    defineArrayMember({
      name: 'mdxBlock',
      title: 'MDX Content Block',
      type: 'object',
      icon: CodeIcon,
      fields: [
        // --- Configuration ---
        defineField({
          name: 'internalTitle',
          title: 'Internal Title',
          type: 'string',
          description: "For internal reference in the Studio (e.g., 'Hero Section').",
          validation: (Rule) => Rule.required(),
        }),

        // --- Content ---
        defineField({
          name: 'mdx',
          title: 'MDX Code',
          type: 'code',
          options: {
            language: 'markdown',
            languageAlternatives: [{ title: 'Markdown', value: 'markdown' }, { title: 'JavaScript', value: 'javascript' }],
            withFilename: false,
          },
          description: 'Write raw MDX for complete layout control.',
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          title: 'internalTitle',
          code: 'mdx.code',
        },
        prepare({ title, code }) {
          const subtitle = code ? code.substring(0, 80).replace(/\n/g, ' ') + (code.length > 80 ? '…' : '') : 'No code yet.';
          return {
            title: title || 'MDX Content Block',
            subtitle: subtitle,
            media: CodeIcon,
          };
        },
      },
    })
  ],
});