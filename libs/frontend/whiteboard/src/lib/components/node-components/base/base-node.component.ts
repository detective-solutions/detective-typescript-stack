import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { AnyWhiteboardNode, IGeneralWhiteboardNodeTemporaryData } from '@detective.solutions/shared/data-access';
import { BehaviorSubject, Subject, Subscription, combineLatest, filter, map, of, switchMap, take } from 'rxjs';
import { WhiteboardNodeActions, selectWhiteboardContextState, selectWhiteboardNodeById } from '../../../state';

import { IWhiteboardContextState } from '../../../state/interfaces';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../services';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  template: '',
  styleUrls: ['./base-node.component.scss'],
})
export class BaseNodeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() node!: AnyWhiteboardNode;

  readonly isDragging$ = this.whiteboardFacade.isDragging$;
  readonly selected$ = this.whiteboardFacade.whiteboardSelection$.pipe(
    map((selectedIds: string[]) => selectedIds.includes(this.node.id))
  );
  readonly nodeUpdates$ = new BehaviorSubject<AnyWhiteboardNode>(this.node);
  readonly nodeTemporaryData$ = this.nodeUpdates$.pipe(
    filter((node: AnyWhiteboardNode) => !!node?.temporary),
    map((node: AnyWhiteboardNode) => node?.temporary),
    filter(Boolean)
  );
  readonly isBlocked$ = this.nodeTemporaryData$.pipe(
    filter((temporaryData: IGeneralWhiteboardNodeTemporaryData) => !!temporaryData?.blockedBy),
    map((temporaryData: IGeneralWhiteboardNodeTemporaryData) => temporaryData?.blockedBy),
    filter(Boolean),
    switchMap((blockedBy: string) =>
      combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(blockedBy).pipe(take(1))])
    ),
    filter(([context, blockedBy]) => context.userId !== blockedBy),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map(([_context, blockedBy]) => blockedBy)
  );
  readonly nodeTitleUpdate$ = new Subject<string>();
  readonly nodeTitleBlur$ = new Subject<string>();

  readonly nodeHeaderHeight = 50;

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

  ngOnInit() {
    // Node update subscription needs to be defined here, otherwise this.id would be undefined
    this.subscriptions.add(
      this.store
        .select(selectWhiteboardNodeById(this.node.id))
        .pipe(filter(Boolean))
        .subscribe((updatedNode: AnyWhiteboardNode) => {
          // WARNING: It is not possible to simply reassign this.node reference when updating the node values
          // Currently the rendering will break due to some conflicts between HTML and SVG handling
          this.updateExistingNodeObject(updatedNode);
          this.nodeUpdates$.next(updatedNode);
        })
    );
    this.customOnInit();
  }

  ngAfterViewInit() {
    this.store
      .select(selectWhiteboardContextState)
      .pipe(
        take(1),
        map((whiteboardContext: IWhiteboardContextState) => whiteboardContext?.userId)
      )
      .subscribe((userId: string) => {
        this.currentUserId = userId;
        this.customAfterViewInit();
        this.whiteboardFacade.applyDragBehaviorToComponent(this as any, this.currentUserId);
        this.whiteboardFacade.applyResizeBehaviorToComponent(this as any);
      });
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
      WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
        updates: [
          {
            id: this.node.id,
            changes: { locked: !this.node.locked },
          },
        ],
      })
    );
  }

  delete() {
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeDeleted({
        deletedNodeId: this.node.id,
      })
    );
    this.customDelete();
  }

  // Can be used by child classes to add custom logic to the ngOnInit hook
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customOnInit() {}

  // Can be used by child classes to add custom logic to the ngAfterViewInit hook
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customAfterViewInit() {}

  // Can be used by child classes to add custom logic to the delete method
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customDelete() {}

  protected updateExistingNodeObject(updatedNode: AnyWhiteboardNode) {
    Object.keys(updatedNode).forEach((key: string) => {
      (this.node as Record<string, any>)[key] = (updatedNode as Record<string, any>)[key];
    });
  }
}
