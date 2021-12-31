import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';

import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';

interface HomeSidenavItem {
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
  @ViewChild('drawer') drawer!: MatSidenav;
  value = '';

  sidenavItems: HomeSidenavItem[] = [
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

  adminSidenavItem: HomeSidenavItem = {
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

  toggleSidebar() {
    this.drawer.toggle();
    console.log(this.drawer.mode);
  }
}
