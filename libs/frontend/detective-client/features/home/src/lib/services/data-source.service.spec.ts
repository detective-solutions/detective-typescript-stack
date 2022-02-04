import { DataSourceService } from './data-source.service';
import { TestBed } from '@angular/core/testing';

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DataSourceService] });
    service = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
