import { BaseCasefileListComponent } from '../base-casefile-list';
import { Component } from '@angular/core';
import { IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { take } from 'rxjs';

@Component({
  selector: 'all-casefiles',
  templateUrl: '../base-casefile-list/base-casefile-list.component.html',
  styleUrls: ['../base-casefile-list/base-casefile-list.component.scss'],
})
export class AllCasefilesComponent extends BaseCasefileListComponent {
  protected override customOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchCasefiles(authStatus.tenantId, '');
      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchCasefiles(authStatus.tenantId, searchTerm)
        )
      );
    });
  }
}
