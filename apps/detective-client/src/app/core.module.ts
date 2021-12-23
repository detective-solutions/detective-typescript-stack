import { NgModule } from '@angular/core';
import { SharedDataAccessModule } from '@detective-frontend/shared/data-access';

@NgModule({
  imports: [SharedDataAccessModule.forRoot()],
})
export class CoreModule {}
