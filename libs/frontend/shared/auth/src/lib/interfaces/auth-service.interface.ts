import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IAuthStatus } from './auth-status.interface';
import { Observable } from 'rxjs';

export interface IAuthService {
  readonly authStatus$: BehaviorSubject<IAuthStatus>;
  login(email: string, password: string): Observable<IAuthStatus>;
  logout(clearToken?: boolean): void;
  getAccessToken(): string;
}

export enum AuthMode {
  CUSTOM_SERVER = 'custom',
}
