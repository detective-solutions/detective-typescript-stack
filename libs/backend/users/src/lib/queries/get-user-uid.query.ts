export const getUserUidQueryName = 'getUserUid';

export interface IGetUserUid {
  [getUserUidQueryName]: { uid: string }[];
}

export const getUserUidQuery = `
  query ${getUserUidQueryName}($id: string) {
    ${getUserUidQueryName}(func: eq(User.xid, $id)) {
      uid
    }
  }
`;
