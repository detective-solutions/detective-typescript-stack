import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, fromEvent, map, share } from 'rxjs';

import { Router } from '@angular/router';

@Component({
  selector: 'multi-table-cell',
  templateUrl: 'multi-table-cell.component.html',
  styleUrls: ['multi-table-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiTableCellComponent implements OnInit {
  readonly windowResized$: Observable<Event> = fromEvent(window, 'resize').pipe(debounceTime(200), share());
  readonly truncateHeader$: Observable<boolean> = this.windowResized$.pipe(
    map(() => this.hasOverflow(this.headerRef)),
    distinctUntilChanged()
  );
  readonly truncateDescription$: Observable<boolean> = this.windowResized$.pipe(
    map(() => this.hasOverflow(this.descriptionRef)),
    distinctUntilChanged()
  );

  readonly casefileBaseUrl = '/casefile/';
  casefileUrl!: string;

  casefileId!: string;
  imageSrc!: string;
  header!: string;
  description!: string;

  @ViewChild('headerRef') headerRef!: ElementRef;
  @ViewChild('descriptionRef') descriptionRef!: ElementRef;

  constructor(private router: Router) {}

  ngOnInit() {
    this.casefileUrl = this.casefileBaseUrl + this.casefileId;
    // Manually dispatch resize event to trigger truncation mechanism on component init
    window.dispatchEvent(new Event('resize'));
  }

  openCasefile() {
    this.router.navigateByUrl(this.casefileUrl);
  }

  private hasOverflow(elementRef: ElementRef) {
    return (
      elementRef.nativeElement.scrollHeight > elementRef.nativeElement.clientHeight ||
      elementRef.nativeElement.scrollWidth > elementRef.nativeElement.clientWidth
    );
  }
}
