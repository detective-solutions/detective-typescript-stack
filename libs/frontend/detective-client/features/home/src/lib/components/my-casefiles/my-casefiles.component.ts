import { BaseCasefileListComponent } from '../base-casefile-list';
import { Component } from '@angular/core';
import { IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { take } from 'rxjs';

@Component({
  selector: 'my-casefiles',
  templateUrl: '../base-casefile-list/base-casefile-list.component.html',
  styleUrls: ['../base-casefile-list/base-casefile-list.component.scss'],
})
export class MyCasefilesComponent extends BaseCasefileListComponent {
  protected override customOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchCasefiles(authStatus.tenantId, '', authStatus.userId);
      // Listen to search input from navigation and search filtered by user id
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchCasefiles(authStatus.tenantId, searchTerm, authStatus.userId)
        )
      );
    });
  }
}
