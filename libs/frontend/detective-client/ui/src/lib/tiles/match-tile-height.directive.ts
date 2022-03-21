import { AfterViewChecked, Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[matchTileHeight]',
})
export class MatchHeightDirective implements AfterViewChecked {
  @Input()
  matchTileHeight!: string;

  constructor(private el: ElementRef) {}

  ngAfterViewChecked() {
    this.matchHeight(this.el.nativeElement, this.matchTileHeight);
  }

  @HostListener('window:resize')
  onResize() {
    // Call matchHeight again when browser window height changes
    this.matchHeight(this.el.nativeElement, this.matchTileHeight);
  }

  matchHeight(parent: HTMLElement, className: string) {
    if (!parent) {
      return;
    }
    const children = parent.getElementsByClassName(className) as HTMLCollectionOf<HTMLElement>;

    if (!children) {
      return;
    }

    const itemHeights = Array.from(children).map((x) => x.clientHeight);
    const maxHeight = itemHeights.reduce((prev, curr) => {
      return curr > prev ? curr : prev;
    }, 0);

    Array.from(children).forEach((x: HTMLElement) => (x.style.height = `${maxHeight}px`));
  }
}
