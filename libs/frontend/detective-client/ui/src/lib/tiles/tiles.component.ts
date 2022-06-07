import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { ITilesInput } from './interfaces/tile.interface';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { Router } from '@angular/router';
import { TOOLTIP_DELAY } from '@detective.solutions/frontend/shared/ui';
import { TileEventService } from './services';

@Component({
  selector: 'tiles-view',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TilesComponent implements OnInit, OnDestroy {
  @Input() tilesInput$!: Observable<ITilesInput>;
  @Input() pageSize = 10;
  @Input() fetchMoreDataByOffset$!: Subject<number>;

  totalElementsCount = 0;
  isFetchingMoreData = false;

  readonly tooltipDelay = TOOLTIP_DELAY;

  private currentPageOffset = 0;
  private alreadyLoadedElementsCount = 0;
  private readonly loadingScrollBuffer = 80;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly tileEventService: TileEventService,
    private readonly logService: LogService
  ) {}

  ngOnInit() {
    // Populate locally loaded elements count and reset fetching state flag
    this.subscriptions.add(
      this.tilesInput$.subscribe((tileInput: ITilesInput) => {
        this.alreadyLoadedElementsCount = tileInput.tiles.length;
        this.totalElementsCount = tileInput.totalElementsCount;
        if (this.isFetchingMoreData) {
          this.isFetchingMoreData = false;
        }
      })
    );

    // Handle resetting of fetching state flag in case of an error
    this.subscriptions.add(
      this.tileEventService.resetLoadingStates$.subscribe(() => {
        this.isFetchingMoreData = false;
        this.logService.debug('Resetting loading indicator due to error');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openTargetUrl(targetUrl: string) {
    this.router.navigateByUrl(targetUrl);
  }

  onScroll(e: Event) {
    const currentScrollLocation = (e.target as HTMLElement).scrollTop;
    const limit =
      (e.target as HTMLElement).scrollHeight - (e.target as HTMLElement).offsetHeight - this.loadingScrollBuffer;

    // If the user has scrolled between the bottom and the loadingScrollBuffer range, add more data
    if (currentScrollLocation > limit) {
      this.currentPageOffset += this.pageSize;
      // Check if all available data was already fetched
      if (!this.isFetchingMoreData && this.alreadyLoadedElementsCount < this.totalElementsCount) {
        this.fetchMoreDataByOffset$.next(this.currentPageOffset);
        this.isFetchingMoreData = true;
      }
    }
  }
}
