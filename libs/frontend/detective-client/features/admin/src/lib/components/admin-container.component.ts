import { Component } from '@angular/core';
import { ISidenavItem } from '@detective.solutions/frontend/detective-client/ui';

@Component({
  selector: 'admin-container',
  template: ` <main-navigation
    [sidenavItems]="sidenavItems"
    [sidenavBottomItem]="sidenavBottomItem"
    [showTileToggle]="false"
    [showSearchInput]="false"
  ></main-navigation>`,
})
export class AdminContainerComponent {
  sidenavItems: ISidenavItem[] = [
    {
      icon: 'settings_input_component',
      translationKey: 'admin.navigation.sidenavItems.connections',
      route: '/admin/connections',
      title: '',
    },
    {
      icon: 'groups',
      translationKey: 'admin.navigation.sidenavItems.groups',
      route: '/admin/groups',
      title: '',
    },
    {
      icon: 'gradient',
      translationKey: 'admin.navigation.sidenavItems.masks',
      route: '/admin/masks',
      title: '',
    },
  ];

  sidenavBottomItem: ISidenavItem = {
    icon: 'arrow_back',
    translationKey: 'admin.navigation.sidenavBottomItem',
    route: '/home',
    title: 'Go back to the home view',
  };
}
