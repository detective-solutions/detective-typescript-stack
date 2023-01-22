export interface IGetUserByIdResponse {
  id: string;
  email: string;
  tenants: {
    id: string;
  };
  role: string;
  firstname: string;
  lastname: string;
  title: string;
  avatarUrl: string;
  lastUpdated: string;
}
