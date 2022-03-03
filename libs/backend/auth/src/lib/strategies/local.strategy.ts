import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtUserInfo, UserLogin } from '@detective.solutions/backend/users';

import { AuthService } from '../auth.service';
import { AuthStrategies } from './auth-strategies.enum';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { validateDto } from '@detective.solutions/backend/shared/utils';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AuthStrategies.LOCAL_STRATEGY) {
  readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<JwtUserInfo> {
    this.logger.log(`Validating incoming credentials for ${email}`);
    await validateDto(UserLogin, { email: email, password: password }, this.logger, BadRequestException);
    return this.authService.validateUser(email, password);
  }
}
