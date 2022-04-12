import { Directive, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[IFrameClickTracker]',
})
export class IFrameTrackerDirective implements OnInit {
  private iFrameElement!: ElementRef | null;

  @Output() iframeClick = new EventEmitter<ElementRef>();

  @HostListener('mouseover')
  private onIframeMouseOver() {
    this.iFrameElement = this.elementRef;
    this.resetFocusOnWindow();
  }

  @HostListener('mouseout')
  private onIframeMouseOut() {
    console.log('mouseout');
    this.iFrameElement = null;
    this.resetFocusOnWindow();
  }

  constructor(private readonly elementRef: ElementRef, private readonly renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.listen(window, 'blur', () => this.onWindowBlur());
  }

  private onWindowBlur() {
    if (this.iFrameElement) {
      this.resetFocusOnWindow();
      this.iframeClick.emit(this.elementRef);
    }
  }

  private resetFocusOnWindow() {
    setTimeout(() => {
      // window.focus();
    }, 100);
  }
}
