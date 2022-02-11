import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@detective.solutions/backend/users';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, LocalStrategy, AccessTokenStrategy],
  exports: [AuthService, UsersModule, JwtModule],
})
export class AuthModule {}
