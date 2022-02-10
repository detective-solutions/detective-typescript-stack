import { IJwtToken, IUser } from '@detective.solutions/shared/data-access';
import { UserLogin, UsersService } from '@detective.solutions/backend/users';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<IUser | null> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserLogin) {
    const payload = { sub: user.email, role: 'basic' } as IJwtToken;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
