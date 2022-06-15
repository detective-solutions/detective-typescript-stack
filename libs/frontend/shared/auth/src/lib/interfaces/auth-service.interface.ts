import { Observable, ReplaySubject } from 'rxjs';

import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IAuthStatus } from './auth-status.interface';
import { User } from '@detective.solutions/frontend/shared/data-access';

export interface IAuthService {
  readonly authStatus$: BehaviorSubject<IAuthStatus>;
  readonly currentUser$: ReplaySubject<User>;
  login(email: string, password: string): Observable<void>;
  logout(clearToken?: boolean): void;
  getAccessToken(): string;
}

export enum AuthMode {
  CUSTOM_SERVER = 'custom',
}
