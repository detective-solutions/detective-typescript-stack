import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';

import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'whiteboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @ViewChild('tableOccurrence', { read: ElementRef }) tableOccurrence!: ElementRef;
  @ViewChild('embedding', { read: ElementRef }) embedding!: ElementRef;

  onDragStart(event: DragEvent) {
    const isTable = event.target === this.tableOccurrence.nativeElement;
    if (isTable) {
      event.dataTransfer?.setData('text/plain', JSON.stringify({ id: 'testId', type: WhiteboardNodeType.TABLE }));
      return;
    }

    const isEmbedding = event.target === this.embedding.nativeElement;
    if (isEmbedding) {
      event.dataTransfer?.setData('text/plain', JSON.stringify({ type: WhiteboardNodeType.EMBEDDING }));
      return;
    }
  }
}
