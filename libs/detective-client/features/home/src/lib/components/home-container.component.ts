import { Component } from '@angular/core';
import { ISidenavItem } from '@detective.solutions/detective-client/ui';

@Component({
  selector: 'home',
  template: `
    <main-navigation [sidenavItems]="sidenavItems" [sidenavBottomItem]="sidenavBottomItem"></main-navigation>
  `,
})
export class HomeContainerComponent {
  searchValue = '';

  sidenavItems: ISidenavItem[] = [
    {
      icon: 'insert_chart_outlined',
      translationKey: 'home.navigation.sidenavItems.myCasefiles',
      route: '/home/my-casefiles',
      title: 'Show all casefiles you participated in',
    },
    {
      icon: 'apps',
      translationKey: 'home.navigation.sidenavItems.allCasefiles',
      route: '/home/all-casefiles',
      title: 'Show all available casefiles',
    },
    {
      icon: 'storage',
      translationKey: 'home.navigation.sidenavItems.dataSources',
      route: '/home/data-sources',
      title: 'Show all available data sources',
    },
  ];

  sidenavBottomItem: ISidenavItem = {
    icon: 'manage_accounts',
    translationKey: 'home.navigation.sidenavBottomItem',
    route: '/admin',
    title: 'Navigate to the admin section',
  };
}
