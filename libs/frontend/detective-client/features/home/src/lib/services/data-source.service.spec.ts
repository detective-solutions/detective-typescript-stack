import { Apollo } from 'apollo-angular';
import { DataSourceService } from './data-source.service';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllDataSourcesGQL } from '../graphql/get-all-data-sources-gql';
import { TestBed } from '@angular/core/testing';

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DataSourceService, Apollo, GetAllDataSourcesGQL, EventService] });
    service = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
