export interface UserRoleUpdateResponse {
  updateUser: {
    user: {
      role: string;
      lastUpdated: string;
    };
  };
}
