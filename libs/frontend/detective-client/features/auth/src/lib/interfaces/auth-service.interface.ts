import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IAuthStatus } from './auth-status.interface';
import { IUser } from '@detective.solutions/shared/data-access';
import { Observable } from 'rxjs';

export interface IAuthService {
  readonly authStatus$: BehaviorSubject<IAuthStatus>;
  readonly currentUser$: BehaviorSubject<IUser>;
  login(email: string, password: string): Observable<void>;
  logout(clearToken?: boolean): void;
  getToken(): string;
}

export enum AuthMode {
  InMemory = 'In Memory',
  CustomServer = 'Custom Server',
}
