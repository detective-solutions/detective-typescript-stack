import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription, map, shareReplay } from 'rxjs';

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
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly eventService: EventService,
    private readonly overlayContainer: OverlayContainer,
    private readonly router: Router
  ) {
    // As the overlay is not part of Angular Material, we need to inject the theme class manually
    this.cdkOverlay = this.overlayContainer.getContainerElement();
    this.cdkOverlay.classList.add('default-theme'); // TODO: Inject a theme service to provide the current theme

    this.showTableView$ = this.eventService.showTableView$;
  }

  toggleViews(toggleChange: MatSlideToggleChange) {
    this.eventService.showTableView$.next(toggleChange.checked);
  }

  logout() {
    this.subscriptions.add(this.authService.logout(true).subscribe(() => this.router.navigateByUrl('login')));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
