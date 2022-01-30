import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ITile } from './interfaces/tile.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'tiles-view',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TilesComponent {
  @Input() tileItems$!: Observable<ITile[]>;
}
