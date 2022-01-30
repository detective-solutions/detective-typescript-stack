import { Component, OnInit } from '@angular/core';
import { ICasefileTableDef, ITile } from '@detective.solutions/frontend/detective-client/ui';
import { Observable, map } from 'rxjs';

import { AbstractCasefileListComponent } from '../abstract/abstract-casefile-list.component';
import { ICasefile } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'my-casefiles',
  templateUrl: './my-casefiles.component.html',
  styleUrls: ['./my-casefiles.component.scss'],
})
export class MyCasefilesComponent extends AbstractCasefileListComponent implements OnInit {
  casefiles$!: Observable<ICasefile[]>;
  tileItems$!: Observable<ITile[]>;
  tableItems$!: Observable<ICasefileTableDef[]>;

  ngOnInit() {
    this.casefiles$ = this.casefileService.casefiles$;
    this.tileItems$ = this.casefiles$.pipe(map((casefiles: ICasefile[]) => this.transformToTileStructure(casefiles)));
    this.tableItems$ = this.casefiles$.pipe(map((casefiles: ICasefile[]) => this.transformToTableStructure(casefiles)));
  }
}
