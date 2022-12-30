import { BaseCasefileListComponent } from '../base';
import { Component } from '@angular/core';

@Component({
  selector: 'my-casefiles',
  templateUrl: './my-casefiles.component.html',
  styleUrls: ['../base/base-casefile-list.component.scss'],
})
export class MyCasefilesComponent extends BaseCasefileListComponent {}
