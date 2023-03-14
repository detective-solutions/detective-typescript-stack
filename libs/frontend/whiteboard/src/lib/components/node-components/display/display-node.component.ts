import { BehaviorSubject, take } from 'rxjs';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IDisplayNodeTemporaryData, IDisplayWhiteboardNode } from '@detective.solutions/shared/data-access';
import { BaseNodeComponent } from '../base/base-node.component';
import { IDisplaySetupInformation } from '../../../models';
import { LoadDisplayNodeData } from './state';
import { WhiteboardNodePropertiesUpdated } from '../../../state/actions/whiteboard-node.actions';

@Component({
  selector: '[displayNode]',
  templateUrl: './display-node.component.html',
  styleUrls: ['./display-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DisplayNodeComponent extends BaseNodeComponent implements OnInit {
  isLoading$ = new BehaviorSubject<boolean>(true);

  currentPageUrl!: string;

  get currentPageIndex(): number {
    return (this.node as IDisplayWhiteboardNode).currentPageIndex ?? 0;
  }

  get currentFilePageUrl(): string {
    return (this.node as IDisplayWhiteboardNode).currentFilePageUrl ?? '';
  }

  get filePageUrls(): string[] {
    return (this.node as IDisplayWhiteboardNode).filePageUrls ?? [];
  }

  get pageCount(): number {
    return (this.node as IDisplayWhiteboardNode).entity?.pageCount ?? 0;
  }

  get expires(): string {
    return (this.node as IDisplayWhiteboardNode).expires ?? new Date().toISOString();
  }

  get fileName(): string {
    return (this.node as IDisplayWhiteboardNode).entity?.fileName ?? '';
  }

  get temporaryData(): IDisplayNodeTemporaryData | undefined {
    return (this.node as IDisplayWhiteboardNode).temporary;
  }

  protected override customOnInit() {
    this.subscriptions.add(
      this.nodeTitleBlur$.subscribe((updatedTitle: string) =>
        this.store.dispatch(
          WhiteboardNodePropertiesUpdated({ updates: [{ id: this.node.id, changes: { title: updatedTitle } }] })
        )
      )
    );

    const localFile = this.temporaryData?.file;
    if (localFile && (localFile as File).size > 0) {
      this.uploadFile(localFile);
    } else {
      if (this.isFileExpired()) {
        this.refreshPages();
      } else {
        this.initializeWithExistingImage();
      }
    }
  }

  previousPage() {
    this.refreshPages();
    if (this.currentPageIndex > 0) {
      this.store.dispatch(
        WhiteboardNodePropertiesUpdated({
          updates: [{ id: this.node.id, changes: { currentPageIndex: this.currentPageIndex - 1 } }],
        })
      );
    }
  }

  nextPage() {
    this.refreshPages();
    if (this.currentPageIndex < this.pageCount - 1) {
      this.store.dispatch(
        WhiteboardNodePropertiesUpdated({
          updates: [{ id: this.node.id, changes: { currentPageIndex: this.currentPageIndex + 1 } }],
        })
      );
    }
  }

  private uploadFile(localFile: File) {
    this.store.dispatch(LoadDisplayNodeData({ nodeId: this.node.id, file: localFile }));
  }

  private initializeWithExistingImage() {
    if (this.currentPageIndex && this.filePageUrls.length !== 0) {
      this.currentPageUrl = this.filePageUrls[this.currentPageIndex];
    } else {
      console.error(this.node);
      throw new Error('Display node is missing current page index or page URLs');
    }
  }

  private refreshPages() {
    this.whiteboardFacade
      .getDisplayLocation(this.node.id, this.fileName)
      .pipe(take(1))
      .subscribe((response: IDisplaySetupInformation) =>
        this.store.dispatch(
          WhiteboardNodePropertiesUpdated({
            updates: [
              {
                id: this.node.id,
                changes: { filePageUrls: response.pages, pageCount: response.pageCount, expires: response.exp },
              },
            ],
          })
        )
      );
  }

  private isFileExpired() {
    return this.expires && this.expires > new Date().toISOString();
  }
}
