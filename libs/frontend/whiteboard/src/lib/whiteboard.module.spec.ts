import { TestBed, async } from '@angular/core/testing';

import { WhiteboardModule } from './whiteboard.module';

describe('WhiteboardModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [WhiteboardModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(WhiteboardModule).toBeDefined();
  });
});
