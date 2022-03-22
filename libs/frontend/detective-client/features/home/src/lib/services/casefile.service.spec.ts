import { Subject, of } from 'rxjs';

import { Apollo } from 'apollo-angular';
import { CasefileService } from './casefile.service';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllCasefilesGQL } from '../graphql/get-all-casefiles-gql';
import { GetCasefilesByAuthorGQL } from '../graphql/get-casefiles-by-author.gql';
import { TestBed } from '@angular/core/testing';

const mockUtils = {
  eventServiceMock: {
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
  let service: CasefileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CasefileService, Apollo, GetAllCasefilesGQL, GetCasefilesByAuthorGQL, EventService],
    });
    service = TestBed.inject(CasefileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
