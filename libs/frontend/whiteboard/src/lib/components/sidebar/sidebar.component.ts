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

interface IAssetsMenuTable {
  id: string;
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
  @ViewChild('assetsSearchInput', { read: ElementRef }) assetsSearchInput!: ElementRef;

  isLoading$ = new Subject<boolean>();
  assetsMenuTables$ = new Subject<IAssetsMenuTable[]>();

  assetsSearchFormControl = new FormControl<string>('', { nonNullable: true });

  private searchTablesByTenantWatchQuery!: QueryRef<Response>;
  private readonly searchDebounceTime = 500;
  private readonly subscriptions = new Subscription();

  constructor(private readonly searchTablesByTenantGQL: SearchTablesByTenantGQL, private readonly store: Store) {}

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([this.store.select(selectWhiteboardContextState), this.assetsSearchFormControl.valueChanges])
        .pipe(debounceTime(this.searchDebounceTime), filter(Boolean), distinctUntilChanged())
        .subscribe(([searchTerm, whiteboardContext]) => this.searchTableAssets(searchTerm, whiteboardContext))
    );
  }

  closeAssetsMenu() {
    this.assetsSearchFormControl.reset();
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
    this.focusSearchInput();
    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1))
      .subscribe((whiteboardContext: IWhiteboardContextState) => this.searchTableAssets(whiteboardContext, ''));
  }

  searchTableAssets(whiteboardContext: IWhiteboardContextState, searchTerm: string) {
    const searchParameters = {
      tenantId: whiteboardContext.tenantId,
      searchTerm: this.buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchTablesByTenantWatchQuery) {
      this.searchTablesByTenantWatchQuery = this.searchTablesByTenantGQL.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
      });
      this.subscriptions.add(
        this.searchTablesByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data),
            map(
              ({ data }: { data: ISearchTablesByTenantGQLResponse }) =>
                data.querySourceConnection
                  .map(SourceConnectionDTO.Build)
                  .filter((sourceConnection: SourceConnectionDTO) => sourceConnection.connectedTables.length > 0)
                  .map((sourceConnection: SourceConnectionDTO) =>
                    this.createTablesFromSourceConnection(sourceConnection)
                  )
                  .flat()
                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            )
          )
          .subscribe((response: IAssetsMenuTable[]) => this.assetsMenuTables$.next(response))
      );
    } else {
      this.searchTablesByTenantWatchQuery.refetch(searchParameters);
    }
  }

  private buildSearchTermRegEx(searchTerm: string) {
    return searchTerm ? `/.*${searchTerm}.*/i` : '/.*/i';
  }

  private createTablesFromSourceConnection(sourceConnection: SourceConnectionDTO) {
    return sourceConnection.connectedTables.map((connectedTable: ITable) => {
      return {
        ...connectedTable,
        iconSrc: sourceConnection.iconSrc,
      };
    });
  }

  private focusSearchInput() {
    if (this.assetsSearchInput) {
      this.assetsSearchInput.nativeElement.focus();
    }
  }
}
