import type {StructureResolver} from 'sanity/structure';

export const structure: StructureResolver = (S) => {
  return S.list()
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
          .title('Home Page Editor')
        ),
        
        S.listItem()
        .schemaType('pageAbout')
        .title('About Page')
        .child(
          S.document()
          .schemaType('pageAbout')
          .documentId('pageAbout')
          .title('About Page Editor')
        ),
        
        S.listItem()
        .schemaType('pageProjects')
        .title('Projects Page')
        .child(
          S.document()
          .schemaType('pageProjects')
          .documentId('pageProjects')
          .title('Projects Page Editor')
        ),
      
        S.listItem()
        .schemaType('pageContact')
        .title('Contact Page')
        .child(
          S.document()
            .schemaType('pageContact')
            .documentId('pageContact')
          .title('Contact Page Editor')
        ),
    ]);
};