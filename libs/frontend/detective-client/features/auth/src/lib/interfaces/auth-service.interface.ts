import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IAuthStatus } from './auth-status.interface';
import { Observable } from 'rxjs';
import { User } from '@detective.solutions/frontend/shared/data-access';

export interface IAuthService {
  readonly authStatus$: BehaviorSubject<IAuthStatus>;
  readonly currentUser$: BehaviorSubject<User>;
  login(email: string, password: string): Observable<void>;
  logout(clearToken?: boolean): void;
  getAccessToken(): string;
}

export enum AuthMode {
  IN_MEMORY = 'inMemory',
  CUSTOM_SERVER = 'custom',
}
