import { Component } from '@angular/core';
import { ISidenavItem } from '@detective.solutions/frontend/detective-client/ui';

@Component({
  selector: 'admin-container',
  template: ` <main-navigation
    [sidenavItems]="sidenavItems"
    [sidenavBottomItem]="sidenavBottomItem"
    [showTileToggle]="false"
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
      icon: 'manage_accounts',
      translationKey: 'admin.navigation.sidenavItems.users',
      route: '/admin/users',
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
      translationKey: 'admin.navigation.sidenavItems.maskings',
      route: '/admin/maskings',
      title: '',
    },
    {
      icon: 'card_membership',
      translationKey: 'admin.navigation.sidenavItems.subscriptions',
      route: '/admin/subscriptions',
      title: '',
    },
  ];

  sidenavBottomItem: ISidenavItem = {
    icon: 'arrow_back',
    translationKey: 'admin.navigation.sidenavBottomItem',
    route: '/home',
    title: 'admin.navigation.sidenavBottomItemTitle',
  };
}
