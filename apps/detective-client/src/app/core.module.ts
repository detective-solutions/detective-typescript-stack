import { NgModule, Optional, SkipSelf } from '@angular/core';
import { SharedDataAccessModule } from '@detective.solutions/frontend/shared/data-access';

@NgModule({
  imports: [SharedDataAccessModule.forRoot()],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        `${parentModule.constructor.name} has already been loaded. Import core modules in the app module only.`
      );
    }
  }
}
