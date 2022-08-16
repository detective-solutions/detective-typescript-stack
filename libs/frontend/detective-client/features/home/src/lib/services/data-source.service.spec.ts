import { EMPTY, Subject, of } from 'rxjs';
import { MockProvider, ngMocks } from 'ng-mocks';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Apollo } from 'apollo-angular';
import { DataSourceService } from './data-source.service';
import { GetAllDataSourcesGQL } from '../graphql';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { SourceConnectionStatus } from '@detective.solutions/shared/data-access';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

const mockUtils = {
  tableCellEventServiceMock: {
    resetLoadingStates$: new Subject(),
  },
  createQueryRefMock: (mockResponse: object) => {
    return {
      valueChanges: of({ data: mockResponse, loading: false, networkStatus: 7 }),
      fetchMore: jest.fn().mockReturnValue(new Promise(jest.fn())),
    };
  },
};

describe('DataSourceService', () => {
  let dataSourceService: DataSourceService;

  ngMocks.faster();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataSourceService,
        GetAllDataSourcesGQL,
        MockProvider(Apollo),
        { provide: TableCellEventService, useValue: mockUtils.tableCellEventServiceMock },
      ],
    });

    dataSourceService = TestBed.inject(DataSourceService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(dataSourceService).toBeTruthy();
  });

  describe('getAllDataSources', () => {
    it('should correctly map the server response to the IGetAllDataSourcesResponse interface', fakeAsync(() => {
      const dataSources = [_createSourceConnection(), _createSourceConnection()];
      const mockResponse = { querySourceConnection: dataSources, aggregateSourceConnection: { count: 2 } };
      const watchQuerySpy = jest
        .spyOn(GetAllDataSourcesGQL.prototype as any, 'watch')
        .mockReturnValue(mockUtils.createQueryRefMock(mockResponse));

      dataSourceService.getAllDataSources(0, 10).subscribe((response: any) => {
        expect(watchQuerySpy).toBeCalledTimes(1);
        expect(watchQuerySpy).toBeCalledWith({ paginationOffset: 0, pageSize: 10 });
        expect(response).toMatchObject({ dataSources: dataSources, totalElementsCount: 2 });
      });
      tick();
    }));

    it('should invoke internal error handling if the response does not comply with the IGetAllDataSourcesResponse interface', fakeAsync(() => {
      const dataSources = [_createSourceConnection()];
      const mockResponse = { wrongKey: dataSources, aggregateSourceConnection: { count: 1 } };
      jest
        .spyOn(GetAllDataSourcesGQL.prototype as any, 'watch')
        .mockReturnValue(mockUtils.createQueryRefMock(mockResponse));
      const handleErrorSpy = jest.spyOn(DataSourceService.prototype as any, 'handleError').mockReturnValue(EMPTY);

      dataSourceService.getAllDataSources(0, 10).subscribe(() => {
        expect(handleErrorSpy).toBeCalledTimes(1);
      });
      tick();
    }));
  });

  describe('getAllDataSourcesNextPage', () => {
    it('should invoke the fetchMore function with correctly forwarded parameters', fakeAsync(() => {
      const mockResponse = { querySourceConnection: [], aggregateSourceConnection: { count: 2 } };
      const queryRefMock = mockUtils.createQueryRefMock(mockResponse);
      const fetchMoreSpy = jest.spyOn(queryRefMock, 'fetchMore');
      jest.spyOn(GetAllDataSourcesGQL.prototype as any, 'watch').mockReturnValue(queryRefMock);

      // Call this function first to init getAllDataSourcesWatchQuery in the DataSourceService
      dataSourceService.getAllDataSources(0, 10).subscribe(() => {
        dataSourceService.getAllDataSourcesNextPage(10, 10);
        expect(fetchMoreSpy).toHaveBeenCalledTimes(1);
        expect(fetchMoreSpy).toBeCalledWith({ variables: { paginationOffset: 10, pageSize: 10 } });
      });
      tick();
    }));

    it('should invoke internal error handling if an error occurs during the execution of the fetchMore function', fakeAsync(() => {
      const mockResponse = { querySourceConnection: [], aggregateSourceConnection: { count: 2 } };
      const queryRefMock = mockUtils.createQueryRefMock(mockResponse);
      const fetchMorePromise = queryRefMock.fetchMore;
      jest.spyOn(GetAllDataSourcesGQL.prototype as any, 'watch').mockReturnValue(queryRefMock);
      const handleErrorSpy = jest.spyOn(DataSourceService.prototype as any, 'handleError').mockReturnValue(EMPTY);

      // Call this function first to init getAllDataSourcesWatchQuery in the DataSourceService
      dataSourceService.getAllDataSources(0, 10).subscribe(async () => {
        await expect(fetchMorePromise).rejects.toThrow();
        expect(handleErrorSpy).toHaveBeenCalledTimes(1);
      });
      tick();
    }));
  });

  function _createSourceConnection(): SourceConnectionDTO {
    return SourceConnectionDTO.Build({
      id: uuidv4(),
      name: 'Test Connection',
      connectorName: 'connector',
      description: '',
      iconSrc: '',
      status: SourceConnectionStatus.AVAILABLE,
      lastUpdated: Date.now().toString(),
    });
  }
});
