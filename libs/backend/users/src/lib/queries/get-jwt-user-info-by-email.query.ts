import { JwtUserInfo } from '../models';

export const getJwtUserInfoByEmailQueryName = 'getJwtUserInfoByEmail';

export interface IGetJwtUserInfoByEmail {
  [getJwtUserInfoByEmailQueryName]: JwtUserInfo[];
}

// Make sure the query matches the API response interface above
export const getJwtUserInfoByEmailQuery = `
  query ${getJwtUserInfoByEmailQueryName}($email: string) {
    ${getJwtUserInfoByEmailQueryName}(func: eq(User.email, $email)) @normalize {
      id: User.xid
      User.tenants {
        tenantId: Tenant.xid
        tenantStatus: Tenant.status
      }
      role: User.role
    }
  }
`;
