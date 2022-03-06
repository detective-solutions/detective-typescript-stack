import { TestBed, async } from '@angular/core/testing';

import { SharedPageNotFoundModule } from './shared-page-not-found.module';

describe('FrontendSharedPageNotFoundModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedPageNotFoundModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(SharedPageNotFoundModule).toBeDefined();
  });
});
