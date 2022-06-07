import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

const modules = [MatButtonModule, MatIconModule];

@NgModule({
  exports: modules,
})
export class HomeMaterialModule {}
