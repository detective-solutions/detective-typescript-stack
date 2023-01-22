/* eslint-disable sort-imports */
import { SkipSelf, Host, HostListener, ElementRef, OnInit, Directive } from '@angular/core';

@Directive({
  selector: '[resizable]',
})
export class ResizableDirective implements OnInit {
  _host!: HTMLElement;
  _startWidth = 0;
  constructor(private elm: ElementRef) {}
  ngOnInit() {
    this._host = this.elm.nativeElement;
  }
  dragStart() {
    const style = window.getComputedStyle(this._host, undefined);
    this._startWidth = style.width ? parseInt(style.width, 10) : 0;
  }
  dragging(diff: number) {
    if (window.innerWidth - 100 > this._startWidth + diff) {
      this._host.style.width = this._startWidth + diff + 'px';
    }
  }
  dragEnd() {
    this._startWidth = 0;
  }
}

@Directive({
  selector: '[grabber]',
})
export class GrabberDirective {
  _startOffsetX = 0;

  @HostListener('mousedown', ['$event']) mousedown = (event: MouseEvent) => {
    this._startOffsetX = event.clientX;
    document.addEventListener('mousemove', this._boundDragging);
    document.addEventListener('mouseup', this._boundDragEnd);
    this.resizable.dragStart();
  };

  readonly _boundDragging = (event: MouseEvent) => this._dragging(event);
  readonly _boundDragEnd = (event: MouseEvent) => this._dragEnd(event);

  constructor(private elm: ElementRef, @Host() @SkipSelf() private resizable: ResizableDirective) {}

  private _dragging(event: MouseEvent) {
    const diff = this._startOffsetX - event.clientX;
    this.resizable.dragging(diff);
  }

  private _dragEnd(event: MouseEvent) {
    this._startOffsetX = 0;
    document.removeEventListener('mousemove', this._boundDragging);
    document.removeEventListener('mouseup', this._boundDragEnd);
    this.resizable.dragEnd();
  }
}
