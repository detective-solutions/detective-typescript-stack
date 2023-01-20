import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthEnvironment } from '@detective.solutions/backend/shared/data-access';
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
      secretOrKey: config.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET),
    });
  }

  async validate(payload: IJwtTokenPayload) {
    return payload;
  }
}
