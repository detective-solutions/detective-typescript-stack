import { TestBed, async } from '@angular/core/testing';

import { SharedErrorHandlingModule } from './shared-error-handling.module';

describe('SharedErrorHandlingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedErrorHandlingModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(SharedErrorHandlingModule).toBeDefined();
  });
});
