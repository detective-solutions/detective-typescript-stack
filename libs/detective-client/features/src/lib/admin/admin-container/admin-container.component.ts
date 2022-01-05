import { Component } from '@angular/core';

interface ISidenavItem {
  icon: string;
  displayValue: string;
  route: string;
  title: string;
}

@Component({
  selector: 'admin-container',
  templateUrl: './admin-container.component.html',
  styleUrls: ['./admin-container.component.scss'],
})
export class AdminContainerComponent {
  sidenavItems: ISidenavItem[] = [
    {
      icon: 'settings_input_component',
      displayValue: 'Connections',
      route: '/admin/connections',
      title: '',
    },
    {
      icon: 'groups',
      displayValue: 'Groups',
      route: '/admin/groups',
      title: '',
    },
    {
      icon: 'gradient',
      displayValue: 'Masks',
      route: '/admin/masks',
      title: '',
    },
  ];

  sidenavBottomItem: ISidenavItem = {
    icon: 'arrow_back',
    displayValue: 'Home',
    route: '/home',
    title: 'Go back to the home view',
  };
}
