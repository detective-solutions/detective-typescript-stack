import { BehaviorSubject, Observable } from 'rxjs';
import { IAuthStatus, defaultAuthStatus } from '../interfaces/auth-status.interface';

import { IAuthService } from '../interfaces/auth-service.interface';
import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';

@Injectable()
export abstract class AuthService implements IAuthService {
  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
  readonly currentUser$ = new BehaviorSubject<IUser>(new User());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(email: string, password: string): Observable<void> {
    return new Observable<void>();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout() {}

  getToken() {
    return '';
  }
}
