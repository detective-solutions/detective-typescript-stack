import { IAuthServerResponse, IJwtTokenPayload, IUser } from '@detective.solutions/shared/data-access';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthEnvironment } from './interfaces/auth-environment.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@detective.solutions/backend/users';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, inputPassword: string): Promise<IUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password === inputPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: IUser): Promise<IAuthServerResponse> {
    return this.getTokens(user);
  }

  async getTokens(user: IUser): Promise<IAuthServerResponse> {
    const jwtPayload: IJwtTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET),
        expiresIn: '1m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>(AuthEnvironment.REFRESH_TOKEN_SECRET),
        expiresIn: '5m',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: IJwtTokenPayload): Promise<IAuthServerResponse> {
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     id: userId,
    //   },
    // });
    const user = await this.usersService.findById(refreshToken.sub);
    // if (!user || !user.hashedRt) throw new UnauthorizedException('Access Denied');
    if (!user) {
      throw new UnauthorizedException();
    }

    // const rtMatches = await argon.verify(user.hashedRt, rt);
    // if (!rtMatches) throw new UnauthorizedException();

    return await this.getTokens(user);
    // await this.updateRtHash(user.id, tokens.refresh_token);
  }
}
