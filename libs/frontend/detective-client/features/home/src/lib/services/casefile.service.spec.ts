import { CasefileService } from './casefile.service';
import { TestBed } from '@angular/core/testing';

describe('CasefileService', () => {
  let service: CasefileService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CasefileService] });
    service = TestBed.inject(CasefileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
