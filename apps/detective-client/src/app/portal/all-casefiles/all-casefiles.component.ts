import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'all-casefiles',
  templateUrl: './all-casefiles.component.html',
  styleUrls: ['./all-casefiles.component.scss'],
})
export class AllCasefilesComponent {
  constructor(private router: Router) {}

  navigateToCasefileView() {
    this.router.navigateByUrl('/casefile');
  }
}
