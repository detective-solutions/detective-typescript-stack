import { IUser, UserRole } from '@detective.solutions/shared/data-access';

import { Injectable } from '@nestjs/common';
import { generate } from 'short-uuid';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: generate(),
      email: 'john.doe@detective.solutions',
      password: 'detective',
      tenantId: generate(),
      role: UserRole.ADMIN,
    },
    {
      id: generate(),
      email: 'emma.doe@detective.solutions',
      password: 'detective',
      tenantId: generate(),
      role: UserRole.BASIC,
    },
  ] as IUser[];

  async findByEmail(email: string): Promise<IUser | null> {
    // TODO: Add real GraphQL query & corresponding error handling
    const matchingUser = this.users.find((user) => user.email === email);
    if (!matchingUser) {
      return null;
    }
    // TODO: Validate incoming user object
    return matchingUser;
  }

  async findById(id: string): Promise<IUser | null> {
    // TODO: Add real GraphQL query & corresponding error handling
    const matchingUser = this.users.find((user) => user.id === id);
    if (!matchingUser) {
      return null;
    }
    // TODO: Validate incoming user object
    return matchingUser;
  }
}
