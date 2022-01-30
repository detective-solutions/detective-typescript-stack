import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PageNotFoundComponent],
  imports: [RouterModule],
})

// This module is necessary to ensure that the RouterModule is available
export class PageNotFoundModule {}
