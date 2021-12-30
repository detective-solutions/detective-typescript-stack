import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'my-casefiles',
  templateUrl: './my-casefiles.component.html',
  styleUrls: ['./my-casefiles.component.scss'],
})
export class MyCasefilesComponent {
  constructor(private router: Router) {}

  navigateToCasefileView() {
    this.router.navigateByUrl('/casefile');
  }
}
