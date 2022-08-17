export const getUidByTypeQueryName = 'getUid';

export interface IGetUid {
  [getUidByTypeQueryName]: { uid: string }[];
}

export function createGetUidByTypeQuery(databaseType: string) {
  return `
      query ${getUidByTypeQueryName}($id: string) {
        ${getUidByTypeQueryName}(func: eq(${databaseType}.xid, $id)) {
          uid
        }
      }
    `;
}
