import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription, catchError, map, shareReplay, tap, throwError } from 'rxjs';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { AuthService } from '@detective.solutions/detective-client/features/auth';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { ISidenavItem } from './ISidenavItem.interface';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Router } from '@angular/router';

@Component({
  selector: 'main-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnDestroy {
  @Input()
  sidenavItems!: ISidenavItem[];
  @Input()
  sidenavBottomItem!: ISidenavItem;
  @Input()
  showTileToggle = true;
  @Input()
  showSearchInput = true;

  searchValue = '';
  logoutErrorToastMessage!: string;
  logoutErrorToastAction!: string;

  subscriptions = new Subscription();

  showTableView$: Observable<boolean>;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  private cdkOverlay: HTMLElement;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly overlayContainer: OverlayContainer,
    private readonly eventService: EventService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    // As the overlay is not part of Angular Material, we need to inject the theme class manually
    this.cdkOverlay = this.overlayContainer.getContainerElement();
    this.cdkOverlay.classList.add('default-theme'); // TODO: Inject a theme service to provide the current theme

    this.showTableView$ = this.eventService.showTableView$;
  }

  toggleViews(toggleChange: MatSlideToggleChange) {
    this.eventService.showTableView$.next(toggleChange.checked);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  logout() {
    this.subscriptions.add(
      this.authService
        .logout(true)
        .pipe(
          tap((logoutSuccessful) => {
            logoutSuccessful ? this.router.navigateByUrl('/login') : this.showLogoutErrorToast();
          }),
          catchError((err) => {
            this.showLogoutErrorToast();
            return throwError(() => new Error(err));
          })
        )
        .subscribe()
    );
  }

  showLogoutErrorToast() {
    // TODO: Add translation to the error toast
    this.toastService.showToast('The Logout was not successful. Please try again.', '', ToastType.ERROR, {
      duration: 3500,
    });
  }
}
