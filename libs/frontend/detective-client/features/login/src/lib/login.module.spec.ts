import { TestBed, async } from '@angular/core/testing';

import { LoginModule } from './login.module';

describe('LoginModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LoginModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(LoginModule).toBeDefined();
  });
});
