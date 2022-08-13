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
        lastUpdatedBy: TableOccurrence.lastUpdatedBy {
          id: User.xid
          firstname: User.firstname
          lastname: User.lastname
          role: User.role
        }
        lastUpdated: TableOccurrence.lastUpdated
        created: TableOccurrence.created
        entity: TableOccurrence.entity {
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
        lastUpdatedBy: UserQueryOccurrence.lastUpdatedBy {
          id: User.xid
          firstname: User.firstname
          lastname: User.lastname
          role: User.role
        }
        lastUpdated: UserQueryOccurrence.lastUpdated
        created: UserQueryOccurrence.created
        entity: UserQueryOccurrence.entity {
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
        lastUpdatedBy: Embedding.lastUpdatedBy {
          id: User.xid
          firstname: User.firstname
          lastname: User.lastname
          role: User.role
        }
        lastUpdated: Embedding.lastUpdated
        created: Embedding.created
      }
    }
  }
`;
