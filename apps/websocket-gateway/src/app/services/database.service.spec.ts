import {
  ICachableCasefileForWhiteboard,
  ICasefileForWhiteboard,
  IUserForWhiteboard,
  UserRole,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';
import {
  createGetUidByTypeQuery,
  getCasefileByIdQuery,
  getCasefileByIdQueryName,
  getUidByTypeQueryName,
  getWhiteboardUserByIdQuery,
  getWhiteboardUserByIdQueryName,
} from '../queries';

import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService } from './database.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('DatabaseService', () => {
  const testUid = '1x11';

  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [DatabaseService],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);

    // Disable logger for test runs
    databaseService.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(databaseService).toBeTruthy();
  });

  describe('getCachableCasefileById', () => {
    const testCasefile: ICasefileForWhiteboard = {
      id: uuidv4(),
      title: 'testCasefile',
      description: 'test',
      tables: [],
      queries: [],
      embeddings: [],
    };

    const convertedCasefile: ICachableCasefileForWhiteboard = {
      id: testCasefile.id,
      title: testCasefile.title,
      description: testCasefile.description,
      nodes: [],
      temporary: { activeUsers: [] },
    };

    it('should return a Casefile object with all mandatory properties', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue({
        [getCasefileByIdQueryName]: [testCasefile],
      });

      const res = await databaseService.getCachableCasefileById(testCasefile.id);

      expect(res).toEqual(convertedCasefile);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(getCasefileByIdQuery, {
        $id: testCasefile.id,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await databaseService.getCachableCasefileById(testCasefile.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${getCasefileByIdQueryName} property`, async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testCasefileData: testCasefile });

      const getCasefileBIdPromise = databaseService.getCachableCasefileById(testCasefile.id);

      await expect(getCasefileBIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one casefile is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getCasefileByIdQueryName]: [testCasefile, testCasefile] });

      const getCasefileByIdPromise = databaseService.getCachableCasefileById(testCasefile.id);

      await expect(getCasefileByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no casefile is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getCasefileByIdQueryName]: [] });

      const res = await databaseService.getCachableCasefileById(testCasefile.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming Casefile object fails', async () => {
      const modifiedCasefile = testCasefile;
      modifiedCasefile.id = ''; // id should not be empty

      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getCasefileByIdQueryName]: [modifiedCasefile] });

      const getCasefileByIdPromise = databaseService.getCachableCasefileById(testCasefile.id);

      await expect(getCasefileByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('getWhiteboardUserById', () => {
    const testUserForWhiteboard: IUserForWhiteboard = {
      id: uuidv4(),
      email: 'test@test.com',
      firstname: 'John',
      lastname: 'Doe',
      title: 'Data Scientist',
      role: UserRole.BASIC,
      avatarUrl: 'http://test.de/testImage',
    };

    it('should return a user object with all mandatory properties', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue({
        [getWhiteboardUserByIdQueryName]: [testUserForWhiteboard],
      });

      const res = await databaseService.getWhiteboardUserById(testUserForWhiteboard.id);

      expect(res).toEqual(testUserForWhiteboard);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(getWhiteboardUserByIdQuery, {
        $id: testUserForWhiteboard.id,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await databaseService.getWhiteboardUserById(testUserForWhiteboard.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${getWhiteboardUserByIdQuery} property`, async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testUserData: testUserForWhiteboard });

      const getWhiteboardUserByIdPromise = databaseService.getWhiteboardUserById(testUserForWhiteboard.id);

      await expect(getWhiteboardUserByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getWhiteboardUserByIdQuery]: [testUserForWhiteboard, testUserForWhiteboard] });

      const getWhiteboardUserByIdPromise = databaseService.getWhiteboardUserById(testUserForWhiteboard.id);

      await expect(getWhiteboardUserByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no user is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getWhiteboardUserByIdQueryName]: [] });

      const res = await databaseService.getWhiteboardUserById(testUserForWhiteboard.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming user object fails', async () => {
      const modifiedUser = testUserForWhiteboard;
      modifiedUser.id = ''; // id should not be empty

      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUidByTypeQueryName]: [modifiedUser] });

      const getWhiteboardUserByIdPromise = databaseService.getWhiteboardUserById(testUserForWhiteboard.id);

      await expect(getWhiteboardUserByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('getUidByType', () => {
    const testId = uuidv4();
    const testResponse = {
      uid: testUid,
    };

    it('should return a valid uid', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUidByTypeQueryName]: [testResponse] });

      const res = await databaseService.getUidByType(testId, WhiteboardNodeType.TABLE);

      expect(res).toBe(testResponse.uid);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(createGetUidByTypeQuery(WhiteboardNodeType.TABLE), {
        $id: testId,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await databaseService.getUidByType(testId, WhiteboardNodeType.EMBEDDING);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${getUidByTypeQueryName} property`, async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ wrongKey: testResponse });

      await expect(databaseService.getUidByType(testId, WhiteboardNodeType.TABLE)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no uid is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUidByTypeQueryName]: [] });

      const res = await databaseService.getUidByType(testId, WhiteboardNodeType.EMBEDDING);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the returned object is missing a uid key', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUidByTypeQueryName]: [{}] });

      await expect(databaseService.getUidByType(testId, WhiteboardNodeType.USER_QUERY)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('saveCasefile', () => {
    const cachedCasefile: ICachableCasefileForWhiteboard = {
      id: uuidv4(),
      title: 'testCasefile',
      description: 'test',
      nodes: [
        {
          id: uuidv4(),
          type: WhiteboardNodeType.TABLE,
          title: '',
          locked: null,
          width: 100,
          height: 100,
          x: 100,
          y: 100,
          author: uuidv4(),
          lastUpdatedBy: uuidv4(),
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          type: WhiteboardNodeType.EMBEDDING,
          title: '',
          locked: null,
          width: 100,
          height: 100,
          x: 100,
          y: 100,
          author: uuidv4(),
          editors: [],
          lastUpdatedBy: uuidv4(),
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      ],
      temporary: { activeUsers: [] },
    };

    const savedCasefile = {
      ...cachedCasefile,
      nodes: [
        {
          id: uuidv4(),
          type: WhiteboardNodeType.TABLE,
          title: '',
          locked: null,
          width: 100,
          height: 100,
          x: 100,
          y: 100,
          author: uuidv4(),
          lastUpdatedBy: uuidv4(),
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      ],
    };

    it('should correctly create all available mutation objects and send them to the database', async () => {
      const getUuidByTypeMock = jest
        .spyOn(DatabaseService.prototype, 'getUidByType')
        .mockResolvedValueOnce('ux1d')
        .mockResolvedValueOnce('ux2d')
        .mockResolvedValueOnce('ux3d')
        .mockResolvedValueOnce('ux4d');
      const getCachableCasefileByIdMock = jest
        .spyOn(DatabaseService.prototype, 'getCachableCasefileById')
        .mockResolvedValue(savedCasefile);
      const getDeleteNodeInCasefileMutationMock = jest
        .spyOn(DatabaseService.prototype, 'getDeleteNodeInCasefileMutation')
        .mockResolvedValue({ uid: '1xus' });
      const getTableOccurrenceToCasefileMutationMock = jest
        .spyOn(DatabaseService.prototype, 'getTableOccurrenceToCasefileMutation')
        .mockResolvedValue({
          uid: '1xus',
          id: uuidv4(),
          title: 'title',
          entity: { uid: '1xu1' },
          casefile: { uid: 'ux1d', 'Casefile.tables': { uid: '2xu1' } },
        });

      await databaseService.saveCasefile(cachedCasefile);

      expect(getUuidByTypeMock).toHaveBeenCalledTimes(4);
      expect(getCachableCasefileByIdMock).toHaveBeenCalledTimes(1);
      expect(getDeleteNodeInCasefileMutationMock).toHaveBeenCalledTimes(1);
      expect(getTableOccurrenceToCasefileMutationMock).toHaveBeenCalledTimes(1);
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('should thrown an exception if no casefile uid could be determined', () => {});

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('should thrown an exception if the deleted nodes could not be determined', () => {});

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('should thrown an exception if the node mutations array could not be created correctly', () => {});

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('should thrown an exception if a casefile metadata mutation could not be created correctly', () => {});

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('should continue with creating further mutations even if one mutation type fails', () => {});
  });
});
