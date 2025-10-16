import { CogIcon } from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

const singletonTypes = ['siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !singletonTypes.includes(listItem.getId()!)
      ),
    ])