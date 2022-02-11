import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthEnvironment } from '../interfaces/auth-environment.enum';
import { ConfigService } from '@nestjs/config';
import { IJwtTokenPayload } from '@detective.solutions/shared/data-access';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token-strategy') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>(AuthEnvironment.REFRESH_TOKEN_SECRET),
    });
  }

  async validate(payload: IJwtTokenPayload) {
    return payload;
  }
}
