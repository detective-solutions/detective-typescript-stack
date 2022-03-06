import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgModule } from '@angular/core';

const modules = [MatSnackBarModule];

@NgModule({
  exports: modules,
})
export class SharedUiMaterialModule {}
