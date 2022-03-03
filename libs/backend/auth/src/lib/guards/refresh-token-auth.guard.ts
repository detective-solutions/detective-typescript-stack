import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from '../strategies/auth-strategies.enum';

export class RefreshTokenGuard extends AuthGuard(AuthStrategies.REFRESH_TOKEN_STRATEGY) {}
