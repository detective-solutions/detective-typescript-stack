import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { ISearchTablesByTenantGQLResponse, SearchTablesByTenantGQL } from '../../graphql';
import { ITable, WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, filter, map, take, tap } from 'rxjs';

import { FormControl } from '@angular/forms';
import { IWhiteboardContextState } from '../../state/interfaces';
import { MatMenuTrigger } from '@angular/material/menu';
import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { Store } from '@ngrx/store';
import { selectWhiteboardContextState } from '../../state';

interface IAssetsMenuDataSource {
  xid: string;
  name: string;
  iconSrc: string;
}

@Component({
  selector: 'whiteboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  @ViewChild('assetsMenuTrigger') assetsMenuTrigger!: MatMenuTrigger;
  @ViewChildren('tableOccurrence', { read: ElementRef }) tableOccurrence!: QueryList<ElementRef>;
  @ViewChild('embedding', { read: ElementRef }) embedding!: ElementRef;
  @ViewChild('assetsMenuIcon', { read: ElementRef }) assetsMenuIcon!: ElementRef;

  dataSources$ = new Subject<IAssetsMenuDataSource[]>();
  pageOffset$ = new Subject<number>();

  isLoading = false;
  totalElementsCount = 0;
  isFetchingMoreData = false;

  searchInput = new FormControl<string>('', { nonNullable: true });

  private searchTablesByTenantWatchQuery!: QueryRef<Response>;
  private currentPageOffset = 0;
  private alreadyLoadedElementsCount = 0;
  private readonly defaultPageSize = 20;
  private readonly subscriptions = new Subscription();

  constructor(private readonly searchTablesByTenantGQL: SearchTablesByTenantGQL, private readonly store: Store) {}

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([this.store.select(selectWhiteboardContextState), this.searchInput.valueChanges])
        .pipe(debounceTime(600), filter(Boolean), distinctUntilChanged())
        .subscribe(([searchTerm, whiteboardContext]) => this.searchTableAssets(searchTerm, whiteboardContext))
    );
  }

  closeDataSourceMenu() {
    this.assetsMenuTrigger.closeMenu();
  }

  onDragStart(event: DragEvent) {
    const isTable = this.tableOccurrence.find((elementRef: ElementRef) => elementRef.nativeElement === event.target);
    if (isTable) {
      event.dataTransfer?.setDragImage(this.assetsMenuIcon.nativeElement, 0, 0);
      event.dataTransfer?.setData(
        'text/plain',
        JSON.stringify({
          type: WhiteboardNodeType.TABLE,
          entityId: isTable.nativeElement.dataset.entityId,
          title: isTable.nativeElement.dataset.name,
        })
      );
      return;
    }

    const isEmbedding = event.target === this.embedding.nativeElement;
    if (isEmbedding) {
      event.dataTransfer?.setData('text/plain', JSON.stringify({ type: WhiteboardNodeType.EMBEDDING }));
    }
  }

  initTableAssets() {
    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1))
      .subscribe((whiteboardContext: IWhiteboardContextState) => this.searchTableAssets(whiteboardContext));
  }

  searchTableAssets(whiteboardContext: IWhiteboardContextState, searchTerm?: string) {
    this.resetPageOffset();

    const searchParameters = {
      tenantId: whiteboardContext.tenantId,
      paginationOffset: this.currentPageOffset,
      pageSize: this.defaultPageSize,
      searchTerm: this.buildSearchTermRegEx(searchTerm ?? ''),
    };

    if (!this.searchTablesByTenantWatchQuery) {
      this.searchTablesByTenantWatchQuery = this.searchTablesByTenantGQL.watch(searchParameters);
      this.subscriptions.add(
        this.searchTablesByTenantWatchQuery.valueChanges
          .pipe(
            tap(() => (this.isLoading = true)),
            map((response: any) => response.data),
            map((response: ISearchTablesByTenantGQLResponse) =>
              response.querySourceConnection
                .map(SourceConnectionDTO.Build)
                .filter((sourceConnection: SourceConnectionDTO) => sourceConnection.connectedTables.length > 0)
                .map((sourceConnection: SourceConnectionDTO) => {
                  return sourceConnection.connectedTables.map((connectedTable: ITable) => {
                    return {
                      ...connectedTable,
                      iconSrc: sourceConnection.iconSrc,
                    };
                  });
                })
                .flat()
            )
          )
          .subscribe((response: any) => {
            this.dataSources$.next(response as IAssetsMenuDataSource[]);
            this.isLoading = false;
          })
      );
    } else {
      this.searchTablesByTenantWatchQuery.refetch(searchParameters);
    }
  }

  private buildSearchTermRegEx(searchTerm: string) {
    return searchTerm ? `/.*${searchTerm}.*/i` : '/.*/i';
  }

  private resetPageOffset() {
    this.currentPageOffset = 0;
  }
}
