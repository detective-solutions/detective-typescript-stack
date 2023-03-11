import { BehaviorSubject, take } from 'rxjs';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseNodeComponent } from '../base/base-node.component';
import { IDisplayWhiteboardNode } from '@detective.solutions/shared/data-access';
import { IInitialSetup } from '../../../models';
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

  protected override customOnInit() {
    this.subscriptions.add(
      this.nodeTitleBlur$.subscribe((updatedTitle: string) =>
        WhiteboardNodePropertiesUpdated({ updates: [{ id: this.node.id, changes: { title: updatedTitle } }] })
      )
    );

    const isFileUploaded = this.currentFilePageUrl && this.currentFilePageUrl?.length !== 0;
    if (!isFileUploaded) {
      const fileToUpload = (this.node as IDisplayWhiteboardNode).temporary?.file;
      if (fileToUpload) {
        console.log('DEBUG: UPLOADING FILE');
        this.store.dispatch(LoadDisplayNodeData({ nodeId: this.node.id, file: fileToUpload }));
      }
    }

    // this.initializeNode();
    // this.setCurrentNodeValues();
    // this.refreshPages();
  }

  private initializeNode() {
    // this.whiteboardFacade
    //   .uploadFile((this.node as IDisplayWhiteboardNode).file)
    //   .pipe(take(1))
    //   .subscribe((response: UploadResponse) => {
    //     this.isInitialized = true;
    //     console.log('UPLOAD RESPONSE: ', response);
    //   });
  }

  refreshPages() {
    if (!this.checkForExpiry()) {
      this.whiteboardFacade
        .getDisplayLocation(this.node.id, this.fileName)
        .pipe(take(1))
        .subscribe((response: IInitialSetup) => {
          (this.node as IDisplayWhiteboardNode).filePageUrls = response.pages ?? [''];
          // (this.node as IDisplayWhiteboardNode).entity?.pageCount = response.pageCount ?? 0;
          // this.setExpiry(response.exp ?? '');
          this.setImageLink();
        });
    }
  }

  checkForExpiry() {
    const expires = (this.node as IDisplayWhiteboardNode).expires;
    if (expires && expires < new Date().toISOString()) {
      return false;
    } else {
      return true;
    }
  }

  setCurrentNodeValues() {
    // this.currentIndex = (this.node as IDisplayWhiteboardNode).currentIndex;
    // this.pages = (this.node as IDisplayWhiteboardNode).pages;
    // this.fileName = (this.node as IDisplayWhiteboardNode).fileName;
    // this.xid = (this.node as IDisplayWhiteboardNode).id.split('-').join('');
    // this.currentLink = (this.node as IDisplayWhiteboardNode).currentLink;
    // this.pageCount = (this.node as IDisplayWhiteboardNode).pageCount;
    // this.expires = (this.node as IDisplayWhiteboardNode).expires;
  }

  // setExpiry(date: string) {
  //   const year = parseInt(date.slice(0, 4));
  //   const month = parseInt(date.slice(5, 7));
  //   const day = parseInt(date.slice(8, 10));
  //   const hours = parseInt(date.slice(11, 13));
  //   const minutes = parseInt(date.slice(14, 16));
  //   const seconds = parseInt(date.slice(17, 19));

  //   this.expires = new Date(year, month, day, hours, minutes, seconds);
  //   this.store.dispatch(
  //     WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
  //       updates: [
  //         {
  //           id: this.node.id,
  //           changes: {
  //             expires: this.expires,
  //           },
  //         },
  //       ],
  //     })
  //   );
  // }

  setImageLink() {
    if (this.filePageUrls.length === this.pageCount && this.currentPageIndex) {
      WhiteboardNodePropertiesUpdated({
        updates: [
          {
            id: this.node.id,
            changes: {
              currentIndex: this.currentPageIndex,
              currentLink: this.filePageUrls[this.currentPageIndex],
            },
          },
        ],
      });
    }
  }

  previousPage() {
    this.refreshPages();
    if (this.currentPageIndex > 0) {
      WhiteboardNodePropertiesUpdated({
        updates: [{ id: this.node.id, changes: { currentIndex: this.currentPageIndex - 1 } }],
      });
      this.setImageLink();
    }
  }

  nextPage() {
    this.refreshPages();
    if (this.currentPageIndex < this.pageCount - 1) {
      WhiteboardNodePropertiesUpdated({
        updates: [{ id: this.node.id, changes: { currentIndex: this.currentPageIndex + 1 } }],
      });
      this.setImageLink();
    }
  }
}
