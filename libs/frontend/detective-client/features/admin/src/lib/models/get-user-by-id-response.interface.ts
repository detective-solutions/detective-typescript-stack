export interface IGetUserByIdResponse {
  xid: string;
  email: string;
  tenants: {
    xid: string;
  };
  role: string;
  firstname: string;
  lastname: string;
  title: string;
  avatarUrl: string;
  lastUpdated: string;
}
