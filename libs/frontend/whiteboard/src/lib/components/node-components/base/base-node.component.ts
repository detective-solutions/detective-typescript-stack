import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { AnyWhiteboardNode, IGeneralWhiteboardNodeTemporaryData } from '@detective.solutions/shared/data-access';
import { BehaviorSubject, Subscription, combineLatest, filter, map, of, pluck, switchMap, take } from 'rxjs';
import { WhiteboardNodeActions, selectWhiteboardContextState } from '../../../state';

import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../services';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  template: '',
  styleUrls: ['./base-node.component.scss'],
})
export class BaseNodeComponent implements AfterViewInit, OnDestroy {
  @Input() node!: AnyWhiteboardNode;

  readonly isDragging$ = this.whiteboardFacade.isDragging$;
  readonly selected$ = this.whiteboardFacade.whiteboardSelection$.pipe(
    map((selectedIds: string[]) => selectedIds.includes(this.node.id))
  );
  readonly nodeUpdates$ = new BehaviorSubject<AnyWhiteboardNode>(this.node);
  readonly nodeTemporaryData$ = this.nodeUpdates$.pipe(
    filter((node: AnyWhiteboardNode) => !!node?.temporary),
    pluck('temporary'),
    filter(Boolean)
  );
  readonly isBlocked$ = this.nodeTemporaryData$.pipe(
    filter((temporaryData: IGeneralWhiteboardNodeTemporaryData) => !!temporaryData?.blockedBy),
    pluck('blockedBy'),
    filter(Boolean),
    switchMap((blockedBy: string) =>
      combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(blockedBy).pipe(take(1))])
    ),
    filter(([context, blockedBy]) => context.userId !== blockedBy),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map(([_context, blockedBy]) => blockedBy)
  );

  protected currentUserId!: string;
  protected readonly subscriptions = new Subscription();

  @HostListener('pointerdown', ['$event'])
  private onPointerDown(event: PointerEvent) {
    // Check if node is blocked by other user
    const isBlockedByUserId = this.node.temporary?.blockedBy;
    if (!isBlockedByUserId || this.currentUserId === isBlockedByUserId) {
      this.whiteboardFacade.addSelectedNode(this.node.id, this.currentUserId);
      this.whiteboardFacade.addDelayedDragHandling(event);
    }
  }

  @HostListener('pointerup')
  private onPointerUp() {
    this.whiteboardFacade.removeDelayedDragHandling();
  }

  constructor(
    public readonly elementRef: ElementRef,
    protected readonly store: Store,
    protected readonly whiteboardFacade: WhiteboardFacadeService,
    protected readonly keyboardService: KeyboardService
  ) {}

  ngAfterViewInit() {
    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1), pluck('userId'))
      .subscribe((userId: string) => {
        this.currentUserId = userId;
        this.whiteboardFacade.applyDragBehaviorToComponent(this, this.currentUserId);
        this.customAfterViewInit();
      });
    this.whiteboardFacade.applyResizeBehaviorToComponent(this);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  preventZoom(event: WheelEvent) {
    // Utility function to only allow zoom while space key is pressed
    if (!this.keyboardService.isSpaceKeyPressed) {
      event.stopPropagation();
    }
  }

  toggleLock() {
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeUpdate({
        update: {
          id: this.node.id,
          changes: { locked: !this.node.locked },
        },
      })
    );
  }

  delete() {
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeDeleted({
        deletedNodeId: this.node.id,
      })
    );
  }

  // Can be used by child classes to add custom logic to the ngAfterViewInit hook
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customAfterViewInit() {}

  protected updateExistingNodeObject(updatedNode: AnyWhiteboardNode) {
    Object.keys(updatedNode).forEach((key: string) => {
      (this.node as Record<string, any>)[key] = (updatedNode as Record<string, any>)[key];
    });
  }
}
