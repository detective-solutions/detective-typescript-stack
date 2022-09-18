import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthModuleEnvironment } from '../interfaces/auth-environment.enum';
import { AuthStrategies } from './auth-strategies.enum';
import { ConfigService } from '@nestjs/config';
import { IJwtTokenPayload } from '@detective.solutions/shared/data-access';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, AuthStrategies.ACCESS_TOKEN_STRATEGY) {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>(AuthModuleEnvironment.ACCESS_TOKEN_SECRET),
    });
  }

  async validate(payload: IJwtTokenPayload) {
    return payload;
  }
}
