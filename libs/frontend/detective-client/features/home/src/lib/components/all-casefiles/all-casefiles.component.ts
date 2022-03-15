import { Component, OnInit } from '@angular/core';
import { ITableInput, ITilesInput } from '@detective.solutions/frontend/detective-client/ui';
import { Observable, map } from 'rxjs';

import { AbstractCasefileListComponent } from '../abstract/abstract-casefile-list.component';
import { IGetAllCasefilesResponse } from '../../interfaces/get-all-casefiles-response.interface';

@Component({
  selector: 'all-casefiles',
  templateUrl: './all-casefiles.component.html',
  styleUrls: ['./all-casefiles.component.scss'],
})
// TODO: Check if more abstraction is possible
export class AllCasefilesComponent extends AbstractCasefileListComponent implements OnInit {
  casefiles$!: Observable<IGetAllCasefilesResponse>;
  tileItems$!: Observable<ITilesInput>;
  tableItems$!: Observable<ITableInput>;

  private readonly initialPageOffset = 0;

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
  }
}
