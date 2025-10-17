import { FolderIcon } from '@sanity/icons';
import type {StructureResolver} from 'sanity/structure';

const singletonTypes = [ 'globalContent', 'projectContent', 'pageAbout', 'pageContact', 'pageHome', 'pageProjects' ];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Editor')
    .items([
      S.listItem()
        .schemaType('globalContent')
        .title('Global Content')
        .child(
          S.document()
            .schemaType('globalContent')
            .documentId('globalContent')
            .title('Global Content Editor')
        ),

      S.listItem()
        .title('All Projects')
        .icon(FolderIcon)
        .child(
          S.documentList()
            .title('Projects')
            .filter('_type == "projectContent"')
        ),

      S.divider().title('All Pages'),
      
      S.listItem()
        .schemaType('pageHome')
        .title('Home Page')
        .child(
          S.document()
            .schemaType('pageHome')
            .documentId('pageHome')
        ),
        
        S.listItem()
        .schemaType('pageProjects')
        .title('About Page')
        .child(
          S.document()
            .schemaType('pageProjects')
            .documentId('pageProjects')
        ),
        
        S.listItem()
        .schemaType('pageAbout')
        .title('Projects Page')
        .child(
          S.document()
            .schemaType('pageAbout')
            .documentId('pageAbout')
        ),
      
        S.listItem()
        .schemaType('pageContact')
        .title('Contact Page')
        .child(
          S.document()
            .schemaType('pageContact')
            .documentId('pageContact')
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => !singletonTypes.includes(listItem.getId()!)
      ),
    ]);