import { JwtUserInfo } from '../models';

export const getJwtUserInfoByIdQueryName = 'getJwtUserInfoById';

export interface IGetJwtUserInfoById {
  [getJwtUserInfoByIdQueryName]: JwtUserInfo[];
}

export const getJwtUserInfoByIdQuery = `
  query ${getJwtUserInfoByIdQueryName}($id: string) {
    ${getJwtUserInfoByIdQueryName}(func: eq(User.xid, $id)) @normalize {
      id: User.xid
      User.tenants {
        tenantId: Tenant.xid
        tenantStatus: Tenant.status
      }
      role: User.role
      refreshTokenId: User.refreshTokenId
    }
  }
`;
