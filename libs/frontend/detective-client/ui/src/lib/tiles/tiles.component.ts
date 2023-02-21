import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { ITile } from './interfaces/tile.interface';
import { Router } from '@angular/router';
import { TOOLTIP_DELAY } from '@detective.solutions/frontend/shared/ui';

@Component({
  selector: 'tiles-view',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TilesComponent implements OnInit, OnDestroy {
  @Input() tiles$!: Observable<ITile[]>;
  @Input() isLoading$!: Observable<boolean>;
  @Input() fetchMoreDataOnScroll$!: Subject<number>;

  readonly tooltipDelay = TOOLTIP_DELAY;

  private alreadyLoadedTiles = 0;
  private isAllDataLoaded = false;

  private readonly subscriptions = new Subscription();

  constructor(private readonly router: Router) {}

  ngOnInit() {
    // Populate locally loaded elements count and reset fetching state flag
    this.subscriptions.add(
      this.tiles$.subscribe((tiles: ITile[]) => {
        this.isAllDataLoaded = this.alreadyLoadedTiles === tiles.length;
        this.alreadyLoadedTiles = tiles.length;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  trackTileById(_index: number, item: ITile) {
    return item.id;
  }

  openTargetUrl(targetUrl: string) {
    this.router.navigateByUrl(targetUrl);
  }

  onScroll() {
    // Check if all data was already loaded
    if (!this.isAllDataLoaded) {
      this.fetchMoreDataOnScroll$.next(this.alreadyLoadedTiles);
    }
  }
}
