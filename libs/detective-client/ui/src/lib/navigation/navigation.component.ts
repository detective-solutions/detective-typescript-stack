import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { ISidenavItem } from './ISidenavItem.interface';

@Component({
  selector: 'main-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
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
  searchValue = '';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
