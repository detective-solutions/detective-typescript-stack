import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@detective.solutions/backend/users';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

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

  async login(user: IUser) {
    const payload = { user: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
