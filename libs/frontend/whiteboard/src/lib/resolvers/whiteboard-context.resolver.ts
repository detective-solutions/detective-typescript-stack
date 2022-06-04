import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardContextActions } from '../state';
import { take } from 'rxjs';

@Injectable()
export class WhiteboardContextResolver implements Resolve<void> {
  constructor(private readonly authService: AuthService, private readonly store: Store) {}

  resolve(route: ActivatedRouteSnapshot) {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) =>
      this.store.dispatch(
        WhiteboardContextActions.initializeWhiteboardContext({
          context: {
            tenantId: authStatus.tenantId,
            casefileId: route.params['id'],
            userId: authStatus.userId,
            userRole: authStatus.userRole,
          },
        })
      )
    );
  }
}
