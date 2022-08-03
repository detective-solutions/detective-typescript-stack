import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgModule } from '@angular/core';

const modules = [MatButtonModule, MatIconModule, MatDialogModule, MatProgressBarModule];

@NgModule({
  exports: modules,
})
export class HomeMaterialModule {}
