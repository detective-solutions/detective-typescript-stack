import { Apollo } from 'apollo-angular';
import { CasefileService } from './casefile.service';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllCasefilesGQL } from '../graphql/get-all-casefiles-gql';
import { GetCasefilesByAuthorGQL } from '../graphql/get-casefiles-by-author.gql';
import { TestBed } from '@angular/core/testing';

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
