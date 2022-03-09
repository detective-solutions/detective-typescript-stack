import { AuthService } from '../auth.service';
import { AuthStrategies } from './auth-strategies.enum';
import { Injectable } from '@nestjs/common';
import { JwtUserInfo } from '@detective.solutions/backend/users';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AuthStrategies.LOCAL_STRATEGY) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<JwtUserInfo> {
    return this.authService.validateUser(email, password);
  }
}
