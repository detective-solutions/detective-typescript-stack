import {
  ICachableCasefileForWhiteboard,
  ICasefileForWhiteboard,
  IEmbeddingWhiteboardNode,
  ITable,
  ITableWhiteboardNode,
  IUser,
  IUserQuery,
  IUserQueryWhiteboardNode,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';
import {
  createGetUidByTypeQuery,
  getCasefileByIdQuery,
  getCasefileByIdQueryName,
  getUidByTypeQueryName,
} from './queries';

import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService } from './database.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

xdescribe('DatabaseService', () => {
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

  describe('getCasefileDataById', () => {
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
      modifiedCasefile.title = undefined; // title should be defined

      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getCasefileByIdQueryName]: [modifiedCasefile] });

      const getCasefileByIdPromise = databaseService.getCachableCasefileById(testCasefile.id);

      await expect(getCasefileByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('addTableOccurrenceToCasefile', () => {
    const testTableWhiteboardNode: ITableWhiteboardNode = {
      id: uuidv4(),
      title: 'test',
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      locked: false,
      lastUpdatedBy: uuidv4(),
      lastUpdated: formatDate(new Date()),
      created: formatDate(new Date()),
      entity: { id: uuidv4() } as ITable,
      type: WhiteboardNodeType.TABLE,
    };

    // it('should return a valid object reference if the database mutation was successful', async () => {
    //   const getUidByTypeSpy = jest.spyOn(databaseService, 'getUidByType').mockResolvedValue(testUid);
    //   const sendMutationSpy = jest.spyOn(DatabaseService.prototype as any, 'sendMutation').mockResolvedValue({});

    //   const expectedMutationJson = {
    //     uid: DatabaseService.mutationNodeReference,
    //     [`${WhiteboardNodeType.TABLE}.xid`]: testTableWhiteboardNode.id,
    //     [`${WhiteboardNodeType.TABLE}.title`]: testTableWhiteboardNode.title,
    //     [`${WhiteboardNodeType.TABLE}.x`]: testTableWhiteboardNode.x,
    //     [`${WhiteboardNodeType.TABLE}.y`]: testTableWhiteboardNode.y,
    //     [`${WhiteboardNodeType.TABLE}.width`]: testTableWhiteboardNode.width,
    //     [`${WhiteboardNodeType.TABLE}.height`]: testTableWhiteboardNode.height,
    //     [`${WhiteboardNodeType.TABLE}.locked`]: testTableWhiteboardNode.locked,
    //     [`${WhiteboardNodeType.TABLE}.lastUpdatedBy`]: {
    //       uid: testUid,
    //     },
    //     [`${WhiteboardNodeType.TABLE}.lastUpdated`]: testTableWhiteboardNode.lastUpdated,
    //     [`${WhiteboardNodeType.TABLE}.created`]: testTableWhiteboardNode.created,
    //     [`${WhiteboardNodeType.TABLE}.entity`]: {
    //       uid: testUid,
    //     },
    //     [`${WhiteboardNodeType.TABLE}.casefile`]: {
    //       uid: testUid,
    //       'Casefile.tables': {
    //         uid: DatabaseService.mutationNodeReference,
    //       },
    //     },
    //     'dgraph.type': WhiteboardNodeType.TABLE,
    //   };

    //   const res = await databaseService.insertTableOccurrenceToCasefile(uuidv4(), testTableWhiteboardNode);

    //   expect(res).toBeTruthy();
    //   expect(getUidByTypeSpy).toBeCalledTimes(3);
    //   expect(sendMutationSpy).toBeCalledTimes(1);
    //   expect(sendMutationSpy).toBeCalledWith(expectedMutationJson);
    // });

    // it('should return null if an error occurred while sending the mutation to the database', async () => {
    //   const getUidByTypeSpy = jest.spyOn(databaseService, 'getUidByType').mockResolvedValue(testUid);
    //   const sendMutationSpy = jest.spyOn(DatabaseService.prototype as any, 'sendMutation').mockResolvedValue(null);

    //   const res = await databaseService.insertTableOccurrenceToCasefile(uuidv4(), testTableWhiteboardNode);

    //   expect(res).toBe(null);
    //   expect(getUidByTypeSpy).toBeCalledTimes(3);
    //   expect(sendMutationSpy).toBeCalledTimes(1);
    // });
  });

  describe('addUserQueryOccurrenceToCasefile', () => {
    const testUserQueryWhiteboardNode: IUserQueryWhiteboardNode = {
      id: uuidv4(),
      title: 'test',
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      locked: false,
      author: uuidv4(),
      editors: [{ id: uuidv4() }, { id: uuidv4() }] as IUser[],
      lastUpdatedBy: uuidv4(),
      lastUpdated: formatDate(new Date()),
      created: formatDate(new Date()),
      entity: { id: uuidv4() } as IUserQuery,
      type: WhiteboardNodeType.USER_QUERY,
    };

    // it('should return a valid object reference if the database mutation was successful', async () => {
    //   const getUidByTypeSpy = jest.spyOn(databaseService, 'getUidByType').mockResolvedValue(testUid);
    //   const sendMutationSpy = jest.spyOn(DatabaseService.prototype as any, 'sendMutation').mockResolvedValue({});

    //   const expectedMutationJson = {
    //     uid: DatabaseService.mutationNodeReference,
    //     [`${WhiteboardNodeType.USER_QUERY}.xid`]: testUserQueryWhiteboardNode.id,
    //     [`${WhiteboardNodeType.USER_QUERY}.title`]: testUserQueryWhiteboardNode.title,
    //     [`${WhiteboardNodeType.USER_QUERY}.x`]: testUserQueryWhiteboardNode.x,
    //     [`${WhiteboardNodeType.USER_QUERY}.y`]: testUserQueryWhiteboardNode.y,
    //     [`${WhiteboardNodeType.USER_QUERY}.width`]: testUserQueryWhiteboardNode.width,
    //     [`${WhiteboardNodeType.USER_QUERY}.height`]: testUserQueryWhiteboardNode.height,
    //     [`${WhiteboardNodeType.USER_QUERY}.locked`]: testUserQueryWhiteboardNode.locked,
    //     [`${WhiteboardNodeType.USER_QUERY}.lastUpdatedBy`]: {
    //       uid: testUid,
    //     },
    //     [`${WhiteboardNodeType.USER_QUERY}.lastUpdated`]: testUserQueryWhiteboardNode.lastUpdated,
    //     [`${WhiteboardNodeType.USER_QUERY}.created`]: testUserQueryWhiteboardNode.created,
    //     [`${WhiteboardNodeType.USER_QUERY}.author`]: { uid: testUid },
    //     [`${WhiteboardNodeType.USER_QUERY}.entity`]: {
    //       uid: testUid,
    //     },
    //     [`${WhiteboardNodeType.USER_QUERY}.casefile`]: {
    //       uid: testUid,
    //       'Casefile.queries': {
    //         uid: DatabaseService.mutationNodeReference,
    //       },
    //     },
    //     'dgraph.type': WhiteboardNodeType.USER_QUERY,
    //   };

    //   const res = await databaseService.insertUserQueryOccurrenceToCasefile(uuidv4(), testUserQueryWhiteboardNode);

    //   expect(res).toBeTruthy();
    //   expect(getUidByTypeSpy).toBeCalledTimes(4);
    //   expect(sendMutationSpy).toBeCalledTimes(1);
    //   expect(sendMutationSpy).toBeCalledWith(expectedMutationJson);
    // });

    // it('should return null if an error occurred while sending the mutation to the database', async () => {
    //   const getUidByTypeSpy = jest.spyOn(databaseService, 'getUidByType').mockResolvedValue(testUid);
    //   const sendMutationSpy = jest.spyOn(DatabaseService.prototype as any, 'sendMutation').mockResolvedValue(null);

    //   const res = await databaseService.insertUserQueryOccurrenceToCasefile(uuidv4(), testUserQueryWhiteboardNode);

    //   expect(res).toBe(null);
    //   expect(getUidByTypeSpy).toBeCalledTimes(4);
    //   expect(sendMutationSpy).toBeCalledTimes(1);
    // });
  });

  describe('addEmbeddingToCasefile', () => {
    const testEmbeddingWhiteboardNode: IEmbeddingWhiteboardNode = {
      id: uuidv4(),
      title: 'test',
      href: 'detective.solutions',
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      locked: false,
      author: uuidv4(),
      editors: [{ id: uuidv4() }, { id: uuidv4() }] as IUser[],
      lastUpdatedBy: uuidv4(),
      lastUpdated: formatDate(new Date()),
      created: formatDate(new Date()),
      type: WhiteboardNodeType.EMBEDDING,
    };

    // it('should return a valid object reference if the database mutation was successful', async () => {
    //   const getUidByTypeSpy = jest.spyOn(databaseService, 'getUidByType').mockResolvedValue(testUid);
    //   const sendMutationSpy = jest.spyOn(DatabaseService.prototype as any, 'sendMutation').mockResolvedValue({});

    //   const expectedMutationJson = {
    //     uid: DatabaseService.mutationNodeReference,
    //     [`${WhiteboardNodeType.EMBEDDING}.xid`]: testEmbeddingWhiteboardNode.id,
    //     [`${WhiteboardNodeType.EMBEDDING}.title`]: testEmbeddingWhiteboardNode.title,
    //     [`${WhiteboardNodeType.EMBEDDING}.href`]: testEmbeddingWhiteboardNode.href,
    //     [`${WhiteboardNodeType.EMBEDDING}.x`]: testEmbeddingWhiteboardNode.x,
    //     [`${WhiteboardNodeType.EMBEDDING}.y`]: testEmbeddingWhiteboardNode.y,
    //     [`${WhiteboardNodeType.EMBEDDING}.width`]: testEmbeddingWhiteboardNode.width,
    //     [`${WhiteboardNodeType.EMBEDDING}.height`]: testEmbeddingWhiteboardNode.height,
    //     [`${WhiteboardNodeType.EMBEDDING}.locked`]: testEmbeddingWhiteboardNode.locked,
    //     [`${WhiteboardNodeType.EMBEDDING}.lastUpdatedBy`]: {
    //       uid: testUid,
    //     },
    //     [`${WhiteboardNodeType.EMBEDDING}.lastUpdated`]: testEmbeddingWhiteboardNode.lastUpdated,
    //     [`${WhiteboardNodeType.EMBEDDING}.created`]: testEmbeddingWhiteboardNode.created,
    //     [`${WhiteboardNodeType.EMBEDDING}.author`]: { uid: testUid },
    //     [`${WhiteboardNodeType.EMBEDDING}.casefile`]: {
    //       uid: testUid,
    //       'Casefile.embeddings': {
    //         uid: DatabaseService.mutationNodeReference,
    //       },
    //     },
    //     'dgraph.type': WhiteboardNodeType.EMBEDDING,
    //   };

    //   const res = await databaseService.insertEmbeddingToCasefile(uuidv4(), testEmbeddingWhiteboardNode);

    //   expect(res).toBeTruthy();
    //   expect(getUidByTypeSpy).toBeCalledTimes(3);
    //   expect(sendMutationSpy).toBeCalledTimes(1);
    //   expect(sendMutationSpy).toBeCalledWith(expectedMutationJson);
    // });

    // it('should return null if an error occurred while sending the mutation to the database', async () => {
    //   const getUidByTypeSpy = jest.spyOn(databaseService, 'getUidByType').mockResolvedValue(testUid);
    //   const sendMutationSpy = jest.spyOn(DatabaseService.prototype as any, 'sendMutation').mockResolvedValue(null);

    //   const res = await databaseService.insertEmbeddingToCasefile(uuidv4(), testEmbeddingWhiteboardNode);

    //   expect(res).toBe(null);
    //   expect(getUidByTypeSpy).toBeCalledTimes(3);
    //   expect(sendMutationSpy).toBeCalledTimes(1);
    // });
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

    it('should throw an InternalServerErrorException if more than one uid is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUidByTypeQueryName]: [testResponse, testResponse] });

      await expect(databaseService.getUidByType(testId, WhiteboardNodeType.EMBEDDING)).rejects.toThrow(
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
});
