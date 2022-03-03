import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from '../strategies/auth-strategies.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategies.LOCAL_STRATEGY) {}
