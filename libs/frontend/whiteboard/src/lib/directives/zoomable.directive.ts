import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { D3Service } from '../services/d3.service';

@Directive({
  selector: '[zoomableOf]',
})
export class ZoomableDirective implements OnInit {
  @Input() zoomableOf!: HTMLElement;

  constructor(private readonly d3Service: D3Service, private readonly element: ElementRef) {}

  ngOnInit() {
    this.d3Service.applyZoomBehavior(this.zoomableOf, this.element.nativeElement);
  }
}
