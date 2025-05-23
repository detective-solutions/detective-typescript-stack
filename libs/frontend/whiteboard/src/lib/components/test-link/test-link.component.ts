import { Component, Input } from '@angular/core';

import { Link } from '../../models';

@Component({
  selector: '[linkVisual]',
  template: `
    <svg:line
      class="link"
      [attr.x1]="link.source.x"
      [attr.y1]="link.source.y"
      [attr.x2]="link.target.x"
      [attr.y2]="link.target.y"
    ></svg:line>
  `,
  styleUrls: ['./test-link.component.scss'],
})
export class TestLinkComponent {
  @Input('linkVisual') link!: Link;
}
