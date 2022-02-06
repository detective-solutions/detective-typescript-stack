import { Observable, of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { IAuthServerResponse } from '../interfaces/auth-server-response.interface';
import { IAuthStatus } from '../interfaces/auth-status.interface';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import { UserRole } from '@detective.solutions/shared/data-access';
import { sign } from 'fake-jwt-sign';

@Injectable()
export class InMemoryAuthService extends AuthService {
  private defaultUser = User.Build({
    email: 'john.tester@test.com',
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
      accessToken: sign(authStatus, 'secret', {
        expiresIn: '1h',
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
