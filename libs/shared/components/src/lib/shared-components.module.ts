import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UiModule } from './ui/ui.module';
import { UtilModule } from './util/util.module';

@NgModule({
  imports: [CommonModule, UiModule, UtilModule],
  exports: [UiModule, UtilModule],
  declarations: [],
})
export class SharedComponentsModule {}
