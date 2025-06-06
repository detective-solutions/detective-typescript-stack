import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ComponentType, OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subscription, debounceTime, distinctUntilChanged, map, shareReplay, take } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { FormControl } from '@angular/forms';
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
export class NavigationComponent implements OnInit {
  @Input()
  sidenavItems!: ISidenavItem[];
  @Input()
  sidenavBottomItem!: ISidenavItem;
  @Input()
  showTileToggle = true;
  @Input()
  showSearchInput = true;

  email!: string;
  logoutErrorToastMessage!: string;
  logoutErrorToastAction!: string;
  showTableView$: Observable<boolean>;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );
  searchFormControl = new FormControl<string>('', { nonNullable: true });

  private cdkOverlay: HTMLElement;
  private readonly searchDebounceTime = 500;
  private readonly subscriptions = new Subscription();

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

  ngOnInit() {
    this.subscriptions.add(
      this.searchFormControl.valueChanges
        .pipe(debounceTime(this.searchDebounceTime), distinctUntilChanged())
        .subscribe((searchTerm: string) => this.navigationEventService.searchInput$.next(searchTerm))
    );
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
