import { Component, OnInit } from '@angular/core';
import { ITableInput, ITilesInput } from '@detective.solutions/frontend/detective-client/ui';
import { Observable, map } from 'rxjs';

import { BaseCasefileListComponent } from '../base/base-casefile-list.component';
import { IGetAllCasefilesResponse } from '../../interfaces';

@Component({
  selector: 'all-casefiles',
  templateUrl: './all-casefiles.component.html',
  styleUrls: ['./all-casefiles.component.scss'],
})
export class AllCasefilesComponent extends BaseCasefileListComponent implements OnInit {
  casefiles$!: Observable<IGetAllCasefilesResponse>;
  tileItems$!: Observable<ITilesInput>;
  tableItems$!: Observable<ITableInput>;

  readonly pageSize = 10;

  ngOnInit() {
    this.casefiles$ = this.casefileService.getAllCasefiles(this.initialPageOffset, this.pageSize);

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
        this.casefileService.getAllCasefilesNextPage(pageOffset, this.pageSize)
      )
    );
  }
}
