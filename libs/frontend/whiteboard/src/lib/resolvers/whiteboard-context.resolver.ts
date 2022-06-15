import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '@detective.solutions/frontend/shared/data-access';
import { WhiteboardContextActions } from '../state';
import { take } from 'rxjs';

@Injectable()
export class WhiteboardContextResolver implements Resolve<void> {
  constructor(private readonly authService: AuthService, private readonly store: Store) {}

  resolve(route: ActivatedRouteSnapshot) {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      this.store.dispatch(
        WhiteboardContextActions.initializeWhiteboardContext({
          context: {
            tenantId: user.tenantIds[0].id,
            casefileId: route.params['id'],
            userId: user.id,
            userRole: user.role,
          },
        })
      );
    });
  }
}
