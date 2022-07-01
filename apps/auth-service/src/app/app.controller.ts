import { AuthService, LocalAuthGuard, RefreshTokenGuard } from '@detective.solutions/backend/auth';
import { Controller, Header, HttpCode, Ip, Post, Request, UseGuards } from '@nestjs/common';
import { IAuthServerResponse } from '@detective.solutions/shared/data-access';

@Controller({ path: 'auth', version: '1' })
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Header('Cache-Control', 'no-store') // according to OAuth 2.0 RFC 6749
  async login(@Request() request, @Ip() ipAddress: string): Promise<IAuthServerResponse> {
    return this.authService.login(request.user, ipAddress);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  async logout(@Request() request): Promise<void> {
    this.authService.logout(request.user);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @Header('Cache-Control', 'no-store') // according to OAuth 2.0 RFC 6749
  async refreshTokens(@Request() request, @Ip() ipAddress: string): Promise<IAuthServerResponse> {
    return this.authService.refreshTokens(request.user, ipAddress);
  }
}
