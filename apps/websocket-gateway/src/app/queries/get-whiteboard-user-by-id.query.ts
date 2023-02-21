import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

export const getWhiteboardUserByIdQueryName = 'getUserById';

export interface IGetUserById {
  [getWhiteboardUserByIdQueryName]: IUserForWhiteboard[];
}

// Make sure the query matches the API response interface above
export const getWhiteboardUserByIdQuery = `
  query ${getWhiteboardUserByIdQueryName}($id: string) {
    ${getWhiteboardUserByIdQueryName}(func: eq(User.id, $id)) {
      id: User.xid
      email: User.email
      firstname: User.firstname
      lastname: User.lastname
      title: User.title
      role: User.role
      avatarUrl: User.avatarUrl
    }
  }
`;
