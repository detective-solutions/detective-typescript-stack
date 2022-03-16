import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { ITilesInput } from './interfaces/tile.interface';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

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

  private currentPageOffset = 0;
  private alreadyLoadedElementsCount = 0;
  private readonly subscriptions = new Subscription();

  constructor(private readonly eventService: EventService, private readonly logService: LogService) {}

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
      this.eventService.resetLoadingStates$.subscribe(() => {
        this.isFetchingMoreData = false;
        this.logService.debug('Resetting loading indicator due to error');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onScroll(e: any) {
    // TODO: Move to own directive
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 80px of the bottom, add more data
    const buffer = 80;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit) {
      this.currentPageOffset += this.pageSize;
      // Check if all available data was already fetched
      if (this.alreadyLoadedElementsCount < this.totalElementsCount) {
        this.fetchMoreDataByOffset$.next(this.currentPageOffset);
        this.isFetchingMoreData = true;
      }
    }
  }
}
