import { DataSource, EventService } from '@detective.solutions/frontend/shared/data-access';
import { Subject, of } from 'rxjs';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Apollo } from 'apollo-angular';
import { DataSourceService } from './data-source.service';
import { GetAllDataSourcesGQL } from '../graphql/get-all-data-sources-gql';
import { ngMocks } from 'ng-mocks';

/* eslint-disable @typescript-eslint/no-explicit-any */

function createQueryRefMock(mockResponse: object) {
  return { valueChanges: of({ data: mockResponse, loading: false, networkStatus: 7 }) };
}

const eventServiceMock = {
  resetLoadingStates$: new Subject(),
};

describe('DataSourceService', () => {
  let dataSourceService: DataSourceService;

  ngMocks.faster();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataSourceService,
        Apollo,
        GetAllDataSourcesGQL,
        { provide: EventService, useValue: eventServiceMock },
      ],
    });

    dataSourceService = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(dataSourceService).toBeTruthy();
  });

  describe('getAllDataSources', () => {
    it('should correctly map the server response to the IGetAllDataSourcesResponse interface', fakeAsync(() => {
      const dataSources = [DataSource.Build(new DataSource())];
      const mockResponse = { querySourceConnection: dataSources, aggregateSourceConnection: { count: 1 } };
      const spy = jest
        .spyOn(GetAllDataSourcesGQL.prototype as any, 'watch')
        .mockReturnValue(createQueryRefMock(mockResponse));

      dataSourceService.getAllDataSources(0, 10).subscribe((response: any) => {
        expect(response).toMatchObject({ dataSources: dataSources, totalElementsCount: 1 });
        expect(spy).toBeCalledTimes(1);
      });
      tick();
    }));
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('should invoke internal error handling if the response does not comply with the IGetAllDataSourcesResponse interface', () => {});

  describe('getAllDataSourcesNextPage', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('', () => {});
  });
});
