import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

import { Component } from '@angular/core';
import { Observable } from 'rxjs';

interface IHomeSidenavItem {
  icon: string;
  displayValue: string;
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
      displayValue: 'My Casefiles',
      route: '/home/my-casefiles',
      title: 'Show all casefiles you participated in',
    },
    {
      icon: 'apps',
      displayValue: 'All Casefiles',
      route: '/home/all-casefiles',
      title: 'Show all available casefiles',
    },
    {
      icon: 'storage',
      displayValue: 'Data Sources',
      route: '/home/data-sources',
      title: 'Show all available data sources',
    },
  ];

  adminSidenavItem: IHomeSidenavItem = {
    icon: 'manage_accounts',
    displayValue: 'Admin',
    route: '/admin',
    title: 'Navigate to the admin section',
  };

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
