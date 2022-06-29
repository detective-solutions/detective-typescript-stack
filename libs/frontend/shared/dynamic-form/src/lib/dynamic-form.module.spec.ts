import { TestBed, async } from '@angular/core/testing';

import { DynamicFormModule } from './dynamic-form.module';

describe('FrontendSharedDynamicFormModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DynamicFormModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(DynamicFormModule).toBeDefined();
  });
});
