import { Component } from '@angular/core';
import { ISidenavItem } from '@detective.solutions/detective-client/ui';

@Component({
  selector: 'admin-container',
  templateUrl: './admin-container.component.html',
  styleUrls: ['./admin-container.component.scss'],
})
export class AdminContainerComponent {
  sidenavItems: ISidenavItem[] = [
    {
      icon: 'settings_input_component',
      translationKey: 'admin.sidebarItems.connections',
      route: '/admin/connections',
      title: '',
    },
    {
      icon: 'groups',
      translationKey: 'admin.sidebarItems.groups',
      route: '/admin/groups',
      title: '',
    },
    {
      icon: 'gradient',
      translationKey: 'admin.sidebarItems.masks',
      route: '/admin/masks',
      title: '',
    },
  ];

  sidenavBottomItem: ISidenavItem = {
    icon: 'arrow_back',
    translationKey: 'Home',
    route: '/home',
    title: 'Go back to the home view',
  };
}
