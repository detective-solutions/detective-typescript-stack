import { Component, OnInit } from '@angular/core';
import { ITableInput, ITilesInput } from '@detective.solutions/frontend/detective-client/ui';
import { Observable, filter, map, switchMap } from 'rxjs';

import { BaseCasefileListComponent } from '../base/base-casefile-list.component';
import { IGetAllCasefilesResponse } from '../../interfaces';

@Component({
  selector: 'my-casefiles',
  templateUrl: './my-casefiles.component.html',
  styleUrls: ['./my-casefiles.component.scss'],
})
export class MyCasefilesComponent extends BaseCasefileListComponent implements OnInit {
  casefiles$!: Observable<IGetAllCasefilesResponse>;
  tileItems$!: Observable<ITilesInput>;
  tableItems$!: Observable<ITableInput>;

  readonly pageSize = 10;

  ngOnInit() {
    this.casefiles$ = this.authService.authStatus$.pipe(
      filter((authStatus) => !!authStatus.userId),
      map((authStatus) => authStatus.userId),
      switchMap((userId) => {
        return this.casefileService.getCasefilesByAuthor(this.initialPageOffset, this.pageSize, userId);
      })
    );

    this.tileItems$ = this.casefiles$.pipe(
      map((response: IGetAllCasefilesResponse) => {
        return {
          tiles: this.transformToTileStructure(response.casefiles),
          totalElementsCount: response.totalElementsCount,
        };
      })
    );

    this.tableItems$ = this.casefiles$.pipe(
      map((response: IGetAllCasefilesResponse) => {
        return {
          tableItems: this.transformToTableStructure(response.casefiles),
          totalElementsCount: response.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.casefileService.getCasefilesByAuthorNextPage(pageOffset, this.pageSize)
      )
    );
  }
}
