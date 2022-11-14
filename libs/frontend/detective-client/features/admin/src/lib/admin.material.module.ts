import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';

const modules = [
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatDialogModule,

  MatProgressBarModule,
  FlexLayoutModule,
  MatGridListModule,
  MatTableModule,
  MatAutocompleteModule,
  MatInputModule,
  MatSelectModule,
  MatTooltipModule,
];

@NgModule({
  exports: modules,
})
export class AdminMaterialModule {}
