import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      email: 'john.doe@detective.solutions',
      password: 'changeme123',
    },
    {
      email: 'emma.doe@detective.solutions',
      password: 'guess',
    },
  ] as IUser[];

  async findOne(email: string): Promise<IUser | undefined> {
    // TODO: Add corresponding error handling
    return this.users.find((user) => user.email === email);
  }
}
