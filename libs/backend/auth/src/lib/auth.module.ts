import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@detective.solutions/backend/users';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: process.env.JWT_LIFESPAN || '10m' } }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, UsersModule, JwtModule],
})
export class AuthModule {}
