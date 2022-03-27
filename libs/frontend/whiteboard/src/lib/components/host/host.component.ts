import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { ForceDirectedGraph } from '../../model';
import { Subscription } from 'rxjs';
import { WhiteboardService } from '../../services';

@Component({
  selector: 'whiteboard-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostComponent implements OnInit {
  width = this.whiteboardService.options.width;
  height = this.whiteboardService.options.height;

  graph!: ForceDirectedGraph;

  nodes$ = this.whiteboardService.nodes$;
  links$ = this.whiteboardService.links$;

  subscriptions = new Subscription();

  constructor(
    private readonly whiteboardService: WhiteboardService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.graph = this.whiteboardService.getForceDirectedGraph();
    // Bind change detection to each graph tick to improve performance
    this.subscriptions.add(
      this.graph.ticker.subscribe(() => {
        this.changeDetectorRef.markForCheck();
      })
    );
  }
}
