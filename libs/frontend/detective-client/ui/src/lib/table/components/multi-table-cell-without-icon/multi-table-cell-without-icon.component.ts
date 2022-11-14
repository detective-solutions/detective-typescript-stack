import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, filter, fromEvent, map, share } from 'rxjs';

import { IMultiTableCellWithoutIcon } from '../../models';
import { TOOLTIP_DELAY } from '@detective.solutions/frontend/shared/ui';

@Component({
  selector: 'multi-table-cell-without-icon',
  templateUrl: 'multi-table-cell-without-icon.component.html',
  styleUrls: ['multi-table-cell-without-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiTableCellWithoutIconComponent implements OnInit {
  readonly tooltipDelay = TOOLTIP_DELAY;

  readonly windowResized$: Observable<Event> = fromEvent(window, 'resize').pipe(debounceTime(200), share());
  readonly truncateName$: Observable<boolean> = this.windowResized$.pipe(
    filter(() => !!this.nameRef),
    map(() => this.hasOverflow(this.nameRef)),
    distinctUntilChanged()
  );
  readonly truncateDescription$: Observable<boolean> = this.windowResized$.pipe(
    filter(() => !!this.descriptionRef),
    map(() => this.hasOverflow(this.descriptionRef)),
    distinctUntilChanged()
  );

  @ViewChild('nameRef') nameRef!: ElementRef;
  @ViewChild('descriptionRef') descriptionRef!: ElementRef;

  cellData!: IMultiTableCellWithoutIcon; // Will be populated by the DynamicTableDirective

  ngOnInit() {
    // Manually dispatch resize event to trigger truncation mechanism on component init
    window.dispatchEvent(new Event('resize'));
  }

  private hasOverflow(elementRef: ElementRef) {
    return (
      elementRef.nativeElement.scrollHeight > elementRef.nativeElement.clientHeight ||
      elementRef.nativeElement.scrollWidth > elementRef.nativeElement.clientWidth
    );
  }
}
