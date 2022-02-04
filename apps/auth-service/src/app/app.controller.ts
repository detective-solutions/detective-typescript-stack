import { AuthService, LocalAuthGuard } from '@detective.solutions/backend/auth';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserLogin } from '@detective.solutions/backend/users';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() user: UserLogin) {
    return this.authService.login(user);
  }
}
