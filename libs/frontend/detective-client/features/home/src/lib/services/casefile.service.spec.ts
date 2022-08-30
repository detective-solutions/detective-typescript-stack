import { EMPTY, Subject, of } from 'rxjs';
import { GetAllCasefilesGQL, GetCasefilesByAuthorGQL } from '../graphql';
import { MockProvider, ngMocks } from 'ng-mocks';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Apollo } from 'apollo-angular';
import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { CasefileService } from './casefile.service';
import { IUser } from '@detective.solutions/shared/data-access';
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

describe('CasefileService', () => {
  let casefileService: CasefileService;

  ngMocks.faster();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CasefileService,
        GetAllCasefilesGQL,
        GetCasefilesByAuthorGQL,
        MockProvider(Apollo),
        { provide: TableCellEventService, useValue: mockUtils.tableCellEventServiceMock },
      ],
    });

    casefileService = TestBed.inject(CasefileService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(casefileService).toBeTruthy();
  });

  describe('getAllCasefiles', () => {
    it('should correctly map the server response to the IGetAllCasefilesResponse interface', fakeAsync(() => {
      const casefiles = [_createCasefile(), _createCasefile()];
      const mockResponse = { queryCasefile: casefiles, aggregateCasefile: { count: 2 } };
      const watchQuerySpy = jest
        .spyOn(GetAllCasefilesGQL.prototype as any, 'watch')
        .mockReturnValue(mockUtils.createQueryRefMock(mockResponse));

      casefileService.getAllCasefiles(0, 10).subscribe((response: any) => {
        expect(watchQuerySpy).toBeCalledTimes(1);
        expect(watchQuerySpy).toBeCalledWith({ paginationOffset: 0, pageSize: 10 });
        expect(response).toMatchObject({ casefiles: casefiles, totalElementsCount: 2 });
      });
      tick();
    }));

    it('should invoke internal error handling if the response does not comply with the IGetAllCasefilesResponse interface', fakeAsync(() => {
      const casefiles = [_createCasefile()];
      const mockResponse = { wrongKey: casefiles, aggregateCasefile: { count: 1 } };
      jest
        .spyOn(GetAllCasefilesGQL.prototype as any, 'watch')
        .mockReturnValue(mockUtils.createQueryRefMock(mockResponse));
      const handleErrorSpy = jest.spyOn(CasefileService.prototype as any, 'handleError').mockReturnValue(EMPTY);

      casefileService.getAllCasefiles(0, 10).subscribe((res) => {
        expect(handleErrorSpy).toBeCalledTimes(1);
      });
      tick();
    }));
  });

  describe('getAllCasefilesNextPage', () => {
    it('should invoke the fetchMore function with correctly forwarded parameters', fakeAsync(() => {
      const mockResponse = { queryCasefile: [], aggregateCasefile: { count: 2 } };
      const queryRefMock = mockUtils.createQueryRefMock(mockResponse);
      const fetchMoreSpy = jest.spyOn(queryRefMock, 'fetchMore');
      jest.spyOn(GetAllCasefilesGQL.prototype as any, 'watch').mockReturnValue(queryRefMock);

      // Call this function first to init getAllCasefilesWatchQuery in the CasefileService
      casefileService.getAllCasefiles(0, 10).subscribe(() => {
        casefileService.getAllCasefilesNextPage(10, 10);
        expect(fetchMoreSpy).toHaveBeenCalledTimes(1);
        expect(fetchMoreSpy).toBeCalledWith({ variables: { paginationOffset: 10, pageSize: 10 } });
      });
      tick();
    }));

    it('should invoke internal error handling if an error occurs during the execution of the fetchMore function', fakeAsync(() => {
      const mockResponse = { queryCasefile: [], aggregateCasefile: { count: 2 } };
      const queryRefMock = mockUtils.createQueryRefMock(mockResponse);
      const fetchMorePromise = queryRefMock.fetchMore;
      jest.spyOn(GetAllCasefilesGQL.prototype as any, 'watch').mockReturnValue(queryRefMock);
      const handleErrorSpy = jest.spyOn(CasefileService.prototype as any, 'handleError').mockReturnValue(EMPTY);

      // Call this function first to init getAllCasefilesWatchQuery in the CasefileService
      casefileService.getAllCasefiles(0, 10).subscribe(async () => {
        await expect(fetchMorePromise).rejects.toThrow();
        expect(handleErrorSpy).toHaveBeenCalledTimes(1);
      });
      tick();
    }));
  });

  describe('getCasefilesByAuthor', () => {
    it('should correctly map the server response to the IGetAllCasefilesResponse interface', fakeAsync(() => {
      const casefiles = [_createCasefile(), _createCasefile()];
      const mockResponse = { queryCasefile: casefiles, aggregateCasefile: { count: 2 } };
      const watchQuerySpy = jest
        .spyOn(GetCasefilesByAuthorGQL.prototype as any, 'watch')
        .mockReturnValue(mockUtils.createQueryRefMock(mockResponse));

      casefileService.getCasefilesByAuthor(0, 10, 'userId').subscribe((response: any) => {
        expect(watchQuerySpy).toBeCalledTimes(1);
        expect(watchQuerySpy).toBeCalledWith({ paginationOffset: 0, pageSize: 10, userId: 'userId' });
        expect(response).toMatchObject({ casefiles: casefiles, totalElementsCount: 2 });
      });
      tick();
    }));

    it('should invoke internal error handling if the response does not comply with the IGetAllCasefilesResponse interface', fakeAsync(() => {
      const casefiles = [_createCasefile()];
      const mockResponse = { wrongKey: casefiles, aggregateCasefile: { count: 1 } };
      jest
        .spyOn(GetCasefilesByAuthorGQL.prototype as any, 'watch')
        .mockReturnValue(mockUtils.createQueryRefMock(mockResponse));
      const handleErrorSpy = jest.spyOn(CasefileService.prototype as any, 'handleError').mockReturnValue(EMPTY);

      casefileService.getCasefilesByAuthor(0, 10, 'userId').subscribe(() => {
        expect(handleErrorSpy).toBeCalledTimes(1);
      });
      tick();
    }));
  });

  describe('getCasefilesByAuthorNextPage', () => {
    it('should invoke the fetchMore function with correctly forwarded parameters', fakeAsync(() => {
      const mockResponse = { queryCasefile: [], aggregateCasefile: { count: 2 } };
      const queryRefMock = mockUtils.createQueryRefMock(mockResponse);
      const fetchMoreSpy = jest.spyOn(queryRefMock, 'fetchMore');
      jest.spyOn(GetCasefilesByAuthorGQL.prototype as any, 'watch').mockReturnValue(queryRefMock);

      // Call this function first to init getCasefilesByAuthorWatchQuery in the CasefileService
      casefileService.getCasefilesByAuthor(0, 10, 'userId').subscribe(() => {
        casefileService.getCasefilesByAuthorNextPage(10, 10);
        expect(fetchMoreSpy).toHaveBeenCalledTimes(1);
        expect(fetchMoreSpy).toBeCalledWith({ variables: { paginationOffset: 10, pageSize: 10 } });
      });
      tick();
    }));

    it('should invoke internal error handling if an error occurs during the execution of the fetchMore function', fakeAsync(() => {
      const mockResponse = { queryCasefile: [], aggregateCasefile: { count: 2 } };
      const queryRefMock = mockUtils.createQueryRefMock(mockResponse);
      const fetchMorePromise = queryRefMock.fetchMore;
      jest.spyOn(GetCasefilesByAuthorGQL.prototype as any, 'watch').mockReturnValue(queryRefMock);
      const handleErrorSpy = jest.spyOn(CasefileService.prototype as any, 'handleError').mockReturnValue(EMPTY);

      // Call this function first to init getCasefilesByAuthorWatchQuery in the CasefileService
      casefileService.getCasefilesByAuthor(0, 10, 'userId').subscribe(async () => {
        await expect(fetchMorePromise).rejects.toThrow();
        expect(handleErrorSpy).toHaveBeenCalledTimes(1);
      });
      tick();
    }));
  });

  function _createCasefile(): CasefileDTO {
    return CasefileDTO.Build({
      id: uuidv4(),
      title: 'Test Casefile',
      description: '',
      thumbnail: '',
      views: 0,
      author: {} as IUser,
      editors: [],
      lastUpdatedBy: {} as IUser,
      lastUpdated: Date.now().toString(),
      created: Date.now().toString(),
      tables: [],
      queries: [],
      embeddings: [],
    });
  }
});
