import { TestBed, async } from '@angular/core/testing';

import { RegisterModule } from './register.module';

describe('RegisterModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RegisterModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(RegisterModule).toBeDefined();
  });
});
