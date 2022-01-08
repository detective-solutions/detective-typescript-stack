import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

import { Component } from '@angular/core';
import { Observable } from 'rxjs';

interface IHomeSidenavItem {
  icon: string;
  translationKey: string;
  route: string;
  title: string;
}

@Component({
  selector: 'home',
  templateUrl: './home-container.component.html',
  styleUrls: ['./home-container.component.scss'],
})
export class HomeContainerComponent {
  searchValue = '';

  sidenavItems: IHomeSidenavItem[] = [
    {
      icon: 'insert_chart_outlined',
      translationKey: 'home.sidenavItems.myCasefiles',
      route: '/home/my-casefiles',
      title: 'Show all casefiles you participated in',
    },
    {
      icon: 'apps',
      translationKey: 'home.sidenavItems.allCasefiles',
      route: '/home/all-casefiles',
      title: 'Show all available casefiles',
    },
    {
      icon: 'storage',
      translationKey: 'home.sidenavItems.dataSources',
      route: '/home/data-sources',
      title: 'Show all available data sources',
    },
  ];

  sidenavBottomItem: IHomeSidenavItem = {
    icon: 'manage_accounts',
    translationKey: 'Admin',
    route: '/admin',
    title: 'Navigate to the admin section',
  };

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
