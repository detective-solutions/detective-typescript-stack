export const getUidQueryName = 'getUid';

export interface IGetUid {
  [getUidQueryName]: { uid: string }[];
}

export function createGetUidQueryByType(databaseType: string) {
  return `
      query ${getUidQueryName}($id: string) {
        ${getUidQueryName}(func: eq(${databaseType}.xid, $id)) {
          uid
        }
      }
    `;
}
