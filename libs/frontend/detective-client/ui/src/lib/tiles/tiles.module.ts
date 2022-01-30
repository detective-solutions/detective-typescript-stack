import { CommonModule } from '@angular/common';
import { MatchHeightDirective } from './match-tile-height.directive';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TilesComponent } from './tiles.component';
import { TilesMaterialModule } from './tiles.material.module';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [TilesComponent, MatchHeightDirective],
  imports: [CommonModule, TranslocoModule, TilesMaterialModule, RouterModule],
  exports: [TilesComponent],
})
export class TilesModule {}
