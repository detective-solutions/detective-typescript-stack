import { Component } from '@angular/core';

@Component({
  selector: 'detective-root',
  template: '<div class="theme-wrapper {{theme}}"><router-outlet></router-outlet></div>',
})
export class AppComponent {
  title = 'detective-client';
  theme = 'default-theme';
}
