import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from '../strategies/auth-strategies.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessTokenGuard extends AuthGuard(AuthStrategies.ACCESS_TOKEN_STRATEGY) {}
