import { IAuthServerResponse, UserRole } from '@detective.solutions/shared/data-access';
import { Observable, of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { IAuthStatus } from '../interfaces/auth-status.interface';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import { generate } from 'short-uuid';
import { sign } from 'fake-jwt-sign';

@Injectable()
export class InMemoryAuthService extends AuthService {
  private defaultUser = User.Build({
    id: generate(),
    email: 'john.tester@test.com',
    tenantId: generate(),
    role: UserRole.BASIC,
    firstname: 'John',
    lastname: 'Tester',
    title: 'Data Scientist',
    userGroups: [],
  });

  constructor() {
    super();
    console.warn("You're using the InMemoryAuthService. Do not use this service in production.");
  }

  protected authProvider(email: string): Observable<IAuthServerResponse> {
    email = email.toLowerCase();

    if (!email.endsWith('@test.com')) {
      return throwError(() => new Error('Failed to login! Email needs to end with @test.com.'));
    }

    const authStatus = {
      isAuthenticated: true,
      userId: this.defaultUser.email,
      userRole: UserRole.BASIC,
    };

    const authResponse = {
      access_token: sign(authStatus, 'secret', {
        expiresIn: '1m',
        algorithm: 'none',
      }),
    } as IAuthServerResponse;
    return of(authResponse);
  }

  protected transformJwtToken(token: IAuthStatus): IAuthStatus {
    return token;
  }

  protected getCurrentUser(): Observable<User> {
    return of(this.defaultUser);
  }
}
