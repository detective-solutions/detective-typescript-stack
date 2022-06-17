import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';

const modules = [MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, FlexLayoutModule];

@NgModule({
  exports: modules,
})
export class AdminMaterialModule {}
