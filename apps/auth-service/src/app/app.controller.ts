import { AuthService, LocalAuthGuard } from '@detective.solutions/backend/auth';
import { Controller, Post, Request, UseGuards } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    // TODO: Add error handling
    return this.authService.login(req.user);
  }
}
