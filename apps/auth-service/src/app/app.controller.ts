import { AccessTokenGuard, AuthService, LocalAuthGuard, RefreshTokenGuard } from '@detective.solutions/backend/auth';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { IAuthServerResponse, IJwtTokenPayload, IUser } from '@detective.solutions/shared/data-access';
import { UsersService } from '@detective.solutions/backend/users';

@Controller({ version: '1' })
export class AppController {
  constructor(private readonly authService: AuthService, private readonly userService: UsersService) {}

  @Post('auth/login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() request): Promise<IAuthServerResponse> {
    return this.authService.login(request.user);
  }

  @Post('auth/refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Body() refreshToken: IJwtTokenPayload): Promise<IAuthServerResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('auth/me')
  @UseGuards(AccessTokenGuard)
  async getUserById(@Request() request): Promise<IUser> {
    return this.userService.findById(request.user.sub);
  }
}
