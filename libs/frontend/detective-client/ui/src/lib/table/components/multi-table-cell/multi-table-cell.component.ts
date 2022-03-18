import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, filter, fromEvent, map, share } from 'rxjs';

@Component({
  selector: 'multi-table-cell',
  templateUrl: 'multi-table-cell.component.html',
  styleUrls: ['multi-table-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiTableCellComponent implements OnInit {
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

  casefileId!: string;
  thumbnailSrc!: string;
  name!: string;
  description!: string;

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
