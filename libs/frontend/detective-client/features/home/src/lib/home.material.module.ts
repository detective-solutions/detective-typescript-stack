import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

const modules = [MatButtonModule, MatIconModule, MatDialogModule];

@NgModule({
  exports: modules,
})
export class HomeMaterialModule {}
