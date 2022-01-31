import { Injectable } from '@nestjs/common';
import { UsersService } from '@detective.solutions/backend/users';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
