/* eslint-disable sort-imports */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IDisplayWhiteboardNode } from '@detective.solutions/shared/data-access';
import { BaseNodeComponent } from '../base/base-node.component';
import { WhiteboardNodeActions } from '../../../state';
import { InitialSetup } from '../../../models';

@Component({
  selector: '[displayNode]',
  templateUrl: './display-node.component.html',
  styleUrls: ['./display-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DisplayNodeComponent extends BaseNodeComponent implements OnInit {
  nodeValues: IDisplayWhiteboardNode = this.node as IDisplayWhiteboardNode;

  currentIndex!: number;
  xid!: string;
  pages!: string[];
  currentLink!: string;
  fileName!: string;
  pageCount!: number;
  expires: Date = new Date();

  protected override customOnInit() {
    this.subscriptions.add(
      this.nodeTitleBlur$.subscribe((updatedTitle: string) =>
        this.store.dispatch(
          WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
            updates: [{ id: this.node.id, changes: { title: updatedTitle } }],
          })
        )
      )
    );

    // this.setCurrentNodeValues();
    this.refreshPages();
  }

  refreshPages() {
    if (!this.checkForExpiry()) {
      this.whiteboardFacade.getDisplayLocation(this.xid, this.fileName).subscribe((response: InitialSetup) => {
        this.pages = response.pages ?? [''];
        this.pageCount = response.pageCount ?? 0;
        this.setExpiry(response.exp ?? '');
        this.setImageLink();
      });
    }
  }

  checkForExpiry() {
    if (this.expires < new Date()) {
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

  setExpiry(date: string) {
    const year = parseInt(date.slice(0, 4));
    const month = parseInt(date.slice(5, 7));
    const day = parseInt(date.slice(8, 10));
    const hours = parseInt(date.slice(11, 13));
    const minutes = parseInt(date.slice(14, 16));
    const seconds = parseInt(date.slice(17, 19));

    this.expires = new Date(year, month, day, hours, minutes, seconds);
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
        updates: [
          {
            id: this.node.id,
            changes: {
              expires: this.expires,
            },
          },
        ],
      })
    );
  }

  setImageLink() {
    if (this.pages.length === this.pageCount) {
      this.currentLink = this.pages[this.currentIndex];

      this.store.dispatch(
        WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
          updates: [
            {
              id: this.node.id,
              changes: {
                currentIndex: this.currentIndex,
                currentLink: this.currentLink,
              },
            },
          ],
        })
      );
    }
  }

  previousPage() {
    this.refreshPages();
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.setImageLink();
    }
  }

  nextPage() {
    this.refreshPages();
    if (this.currentIndex < this.pageCount - 1) {
      this.currentIndex += 1;
      this.setImageLink();
    }
  }
}
