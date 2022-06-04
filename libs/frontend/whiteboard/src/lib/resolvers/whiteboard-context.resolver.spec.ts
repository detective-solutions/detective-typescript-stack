import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { ActivatedRouteSnapshot } from '@angular/router';
import { IWhiteboardContextState } from '../state/interfaces';
import { TestBed } from '@angular/core/testing';
import { UserRole } from '@detective.solutions/shared/data-access';
import { WhiteboardContextActions } from '../state';
import { WhiteboardContextResolver } from './whiteboard-context.resolver';
import { of } from 'rxjs';

const mockWhiteboardContext = {
  tenantId: 'testTenantId',
  userId: 'testUserId',
  userRole: UserRole.BASIC,
} as IAuthStatus;

const mockAuthService = {
  authStatus$: of(mockWhiteboardContext),
};

describe('WhiteboardContextResolver', () => {
  let resolver: WhiteboardContextResolver;
  let route: ActivatedRouteSnapshot;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WhiteboardContextResolver, provideMockStore(), { provide: AuthService, useValue: mockAuthService }],
    });
    resolver = TestBed.inject(WhiteboardContextResolver);
    route = new ActivatedRouteSnapshot();
    store = TestBed.inject(MockStore);
  });

  it('should create an instance', () => {
    expect(resolver).toBeTruthy();
  });

  describe('resolve', () => {
    it('should correctly populate the whiteboard context store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch').mockImplementation();
      const expectedCasefileId = 'testCasefileId';
      route.params = { id: expectedCasefileId };

      resolver.resolve(route);

      expect(dispatchSpy).toBeCalledWith({
        type: WhiteboardContextActions.initializeWhiteboardContext.type,
        context: {
          tenantId: mockWhiteboardContext.tenantId,
          casefileId: expectedCasefileId,
          userId: mockWhiteboardContext.userId,
          userRole: mockWhiteboardContext.userRole,
        } as IWhiteboardContextState,
      });
    });
  });
});
