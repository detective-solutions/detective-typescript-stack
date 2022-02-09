import { AuthMode, InMemoryAuthService } from '@detective.solutions/detective-client/features/auth';

import { CustomAuthService } from './auth.custom.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@detective.solutions/frontend/shared/environments';

export function authFactory(httpClient: HttpClient) {
  switch (environment.authMode) {
    case AuthMode.IN_MEMORY:
      return new InMemoryAuthService();
    default:
      return new CustomAuthService(httpClient);
  }
}
