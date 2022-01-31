import { Injectable } from '@nestjs/common';
import { User } from '@detective.solutions/shared/data-access';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      email: 'john.doe@detective.solutions',
      password: 'changeme',
    },
    {
      email: 'emma.doe@detective.solutions',
      password: 'guess',
    },
  ] as User[];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
