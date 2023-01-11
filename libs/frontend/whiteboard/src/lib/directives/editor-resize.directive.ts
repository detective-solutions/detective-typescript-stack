/* eslint-disable sort-imports */
import {
  ChangeDetectionStrategy,
  SkipSelf,
  Host,
  HostListener,
  EventEmitter,
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
  Directive,
} from '@angular/core';

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

  @HostListener('mousedown', ['$event']) mousedown = (e: MouseEvent) => {
    this._startOffsetX = e.clientX;
    document.addEventListener('mousemove', this._boundDragging);
    document.addEventListener('mouseup', this._boundDragEnd);
    this.resizable.dragStart();
  };

  readonly _boundDragging = (e: any) => this._dragging(e);
  readonly _boundDragEnd = (e: any) => this._dragEnd(e);

  constructor(private elm: ElementRef, @Host() @SkipSelf() private resizable: ResizableDirective) {}

  private _dragging(e: MouseEvent) {
    const diff = this._startOffsetX - e.clientX;
    this.resizable.dragging(diff);
  }

  private _dragEnd(e: MouseEvent) {
    this._startOffsetX = 0;
    document.removeEventListener('mousemove', this._boundDragging);
    document.removeEventListener('mouseup', this._boundDragEnd);
    this.resizable.dragEnd();
  }
}
