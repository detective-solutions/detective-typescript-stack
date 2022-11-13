import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentType, OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, map, shareReplay, take } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { ISidenavItem } from '../interfaces';
import { InviteDialogComponent } from './dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NavigationEventService } from '../services';
import { Router } from '@angular/router';

@Component({
  selector: 'main-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  @Input()
  sidenavItems!: ISidenavItem[];
  @Input()
  sidenavBottomItem!: ISidenavItem;
  @Input()
  showTileToggle = true;
  @Input()
  showSearchInput = true;

  email!: string;
  searchValue = '';
  logoutErrorToastMessage!: string;
  logoutErrorToastAction!: string;
  showTableView$: Observable<boolean>;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  private cdkOverlay: HTMLElement;

  constructor(
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly navigationEventService: NavigationEventService,
    private readonly overlayContainer: OverlayContainer,
    private readonly matDialog: MatDialog,
    private readonly router: Router
  ) {
    // As the overlay is not part of Angular Material, we need to inject the theme class manually
    this.cdkOverlay = this.overlayContainer.getContainerElement();
    this.cdkOverlay.classList.add('default-theme'); // TODO: Inject a theme service to provide the current theme

    this.showTableView$ = this.navigationEventService.showTableView$;
  }

  toggleViews(toggleChange: MatSlideToggleChange) {
    this.navigationEventService.showTableView$.next(toggleChange.checked);
  }

  openInviteDialog(componentToOpen?: ComponentType<InviteDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? InviteDialogComponent, {
      ...{
        width: '600px',
        minWidth: '600px',
        data: { email: this.email },
      },
      ...config,
    });
  }

  logout() {
    this.authService
      .logout(true)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigateByUrl('login');
      });
  }
}
