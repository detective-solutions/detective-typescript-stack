import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';

export const getCasefileByIdQueryName = 'getCasefileById';

export interface IGetCasefileById {
  [getCasefileByIdQueryName]: ICasefileForWhiteboard[];
}

// Make sure the query matches the API response interface above
export const getCasefileByIdQuery = `
  query ${getCasefileByIdQueryName}($id: string) {
    ${getCasefileByIdQueryName}(func: eq(Casefile.xid, $id)) {
      id: Casefile.xid
      title: Casefile.title
      description: Casefile.description
      tables: Casefile.tables @normalize {
        id: TableOccurrence.xid
        title: TableOccurrence.title
        x: TableOccurrence.x
        y: TableOccurrence.y
        width: TableOccurrence.width
        height: TableOccurrence.height
        locked: TableOccurrence.locked
        TableOccurrence.lastUpdatedBy {
          lastUpdatedBy: User.xid
        }
        lastUpdated: TableOccurrence.lastUpdated
        created: TableOccurrence.created
        entity: TableOccurrence.entity {
          id: Table.xid
          name: Table.name
          description: Table.description
        }
      }
      queries: Casefile.queries @normalize {
        id: UserQueryOccurrence.xid
        name: UserQueryOccurrence.name
        x: UserQueryOccurrence.x
        y: UserQueryOccurrence.y
        width: UserQueryOccurrence.width
        height: UserQueryOccurrence.height
        locked: UserQueryOccurrence.locked
        UserQueryOccurrence.author {
          author: User.xid
        }
        UserQueryOccurrence.lastUpdatedBy {
          lastUpdatedBy: User.xid
        }
        lastUpdated: UserQueryOccurrence.lastUpdated
        created: UserQueryOccurrence.created
        entity: UserQueryOccurrence.entity {
          id: UserQuery.xid
          code: UserQuery.code
        }
      }
      displays: Casefile.displays @normalize {
        id: DisplayOccurrence.xid
        title: DisplayOccurrence.title
        x: DisplayOccurrence.x
        y: DisplayOccurrence.y
        width: DisplayOccurrence.width
        height: DisplayOccurrence.height
        locked: DisplayOccurrence.locked
        DisplayOccurrence.author @normalize {
          author: User.xid
        }
        DisplayOccurrence.lastUpdatedBy @normalize {
          lastUpdatedBy: User.xid
        }
        lastUpdated: DisplayOccurrence.lastUpdated
        created: DisplayOccurrence.created
        currentPageIndex: DisplayOccurrence.currentPageIndex
        filePageUrls: DisplayOccurrence.filePageUrls
        expires: DisplayOccurrence.expires
        DisplayOccurrence.entity {
          fileName: Display.fileName
          pageCount: Display.pageCount
        }
      }
      embeddings: Casefile.embeddings @normalize {
        id: Embedding.xid
        title: Embedding.title
        x: Embedding.x
        y: Embedding.y
        width: Embedding.width
        height: Embedding.height
        locked: Embedding.locked
        Embedding.author {
          author: User.xid
        }
        Embedding.lastUpdatedBy {
          lastUpdatedBy: User.xid
        }
        lastUpdated: Embedding.lastUpdated
        created: Embedding.created
      }
    }
  }
`;
