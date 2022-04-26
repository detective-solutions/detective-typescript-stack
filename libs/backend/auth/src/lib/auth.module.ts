import { AccessTokenStrategy, LocalStrategy, RefreshTokenStrategy } from './strategies';

import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@detective.solutions/backend/users';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, LocalStrategy, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService, UsersModule, JwtModule],
})
export class AuthModule {}
