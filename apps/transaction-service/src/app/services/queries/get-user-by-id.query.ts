import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

export const getUserByIdQueryName = 'getUserById';

export interface IGetUserById {
  [getUserByIdQueryName]: IUserForWhiteboard[];
}

// Make sure the query matches the API response interface above
export const getUserByIdQuery = `
  query ${getUserByIdQueryName}($id: string) {
    ${getUserByIdQueryName}(func: eq(User.xid, $id)) {
      id: User.xid
      email: User.email
      firstname: User.description
      lastname: User.tables {
      title: User.title
      role: User.role
      avatarUrl: User.avatarUrl
      }
    }
  }
`;
