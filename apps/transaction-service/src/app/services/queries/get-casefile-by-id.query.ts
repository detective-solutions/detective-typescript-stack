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
      tables: Casefile.tables {
        id: TableOccurrence.xid
        title: TableOccurrence.title
        x: TableOccurrence.x
        y: TableOccurrence.y
        width: TableOccurrence.width
        height: TableOccurrence.height
        locked: TableOccurrence.locked
        TableOccurrence.lastUpdatedBy @normalize {
          lastUpdateBy: User.xid
        }
        lastUpdated: TableOccurrence.lastUpdated
        created: TableOccurrence.created
        entity: TableOccurrence.entity {
          id: Table.xid
          name: Table.name
          description: Table.description
        }
      }
      queries: Casefile.queries {
        id: UserQueryOccurrence.xid
        name: UserQueryOccurrence.name
        x: UserQueryOccurrence.x
        y: UserQueryOccurrence.y
        width: UserQueryOccurrence.width
        height: UserQueryOccurrence.height
        locked: UserQueryOccurrence.locked
        UserQueryOccurrence.author @normalize {
          author: User.xid
        }
        UserQueryOccurrence.lastUpdatedBy @normalize {
          lastUpdatedBy: User.xid
        }
        lastUpdated: UserQueryOccurrence.lastUpdated
        created: UserQueryOccurrence.created
        entity: UserQueryOccurrence.entity {
          id: UserQuery.xid
          code: UserQuery.code
        }
      }
      embeddings: Casefile.embeddings {
        id: Embedding.xid
        title: Embedding.title
        href: Embedding.href
        x: Embedding.x
        y: Embedding.y
        width: Embedding.width
        height: Embedding.height
        locked: Embedding.locked
        Embedding.author @normalize {
          author: User.xid
        }
        Embedding.lastUpdatedBy @normalize {
          lastUpdatedBy: User.xid
        }
        lastUpdated: Embedding.lastUpdated
        created: Embedding.created
      }
    }
  }
`;
